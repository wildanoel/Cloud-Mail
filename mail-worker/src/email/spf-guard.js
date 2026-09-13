// SPF/DMARC inbound guard for the Cloud Mail email handler.
//
// Why: Cloudflare Email Routing does NOT enforce SPF on inbound, so any
// host on the internet can claim MAIL FROM of our own domains and the message
// lands in local mailboxes (verified via authorized security testing: a
// forged sender address on a locally-hosted domain was accepted and stored).
// Gmail/Yahoo/Outlook protect their own users; our users are unprotected.
//
// Two-layer verdict:
//   1) Trust auth verdict headers Cloudflare may attach to the raw message
//      (Received-SPF / Authentication-Results).
//   2) If no usable verdicts, compute SPF ourselves from the connecting
//      client-ip found in the Received chain added by CF's MX, via DNS-over-
//      HTTPS (dns.google JSON API) - Workers have no raw DNS.
//
// Policy (fail-open - must never break legitimate mail):
//   - Only acts when the From: address claims one of OUR own domains.
//   - Reject on dmarc=fail or spf=fail from headers, or computed spf=fail.
//   - Apex-exact claim with softfail/none and no dkim/dmarc pass -> reject.
//   - temperror / lookups exhausted / no client-ip -> accept.

const DNS_API = "https://dns.google/resolve";
const MAX_DNS_LOOKUPS = 10;
const MAX_INCLUDE_DEPTH = 2;

function headBlock(raw) {
	const sepIdx = Math.max(
		raw.indexOf("\r\n\r\n"),
		raw.indexOf("\n\n")
	);
	const head = sepIdx === -1 ? raw.slice(0, 64 * 1024) : raw.slice(0, sepIdx);
	// unfold RFC5322 continuation lines, lowercase for matching
	return head.replace(/\r?\n[ \t]+/g, " ").toLowerCase();
}

function headerVerdicts(headLower) {
	const rs = headLower.match(/received-spf:\s*([a-z]+)/);
	const ar = headLower.match(/spf=(fail|pass|softfail|none|neutral|permerror|temperror)/);
	const dk = headLower.match(/dkim=(pass|fail|none)/);
	const dm = headLower.match(/dmarc=(pass|fail|none)/);
	return {
		spf: rs ? rs[1] : ar ? ar[1] : null,
		dkim: dk ? dk[1] : null,
		dmarc: dm ? dm[1] : null,
	};
}

function claimedDomain(address) {
	const at = String(address || "").trim().lastIndexOf("@");
	return at === -1 ? "" : String(address).trim().slice(at + 1).toLowerCase();
}

export function parseOwnDomains(envDomain) {
	if (!envDomain) return [];
	if (Array.isArray(envDomain)) return envDomain.map((d) => String(d).toLowerCase());
	try {
		const parsed = JSON.parse(envDomain);
		if (Array.isArray(parsed)) return parsed.map((d) => String(d).toLowerCase());
		return [String(parsed).toLowerCase()];
	} catch (e) {
		return String(envDomain)
			.split(",")
			.map((d) => d.trim().toLowerCase())
			.filter(Boolean);
	}
}

// extract IPv4 the CF MX saw as the connecting client: prefer explicit
// client-ip=/ip= tokens in the cloudflare-received line, else bracketed ip.
function clientIp(headRaw) {
	const lines = headRaw.split(/\r?\n/);
	for (const line of lines) {
		if (!/cloudflare/.test(line.toLowerCase())) continue;
		let m = line.match(/client-ip=(\d{1,3}(?:\.\d{1,3}){3})/i);
		if (m) return m[1];
		m = line.match(/\((?:[^)]*?\[)?(\d{1,3}(?:\.\d{1,3}){3})\]?/);
		if (m) return m[1];
	}
	for (const line of lines) {
		if (!/^received:/.test(line.toLowerCase())) continue;
		const m = line.match(/client-ip=(\d{1,3}(?:\.\d{1,3}){3})/i);
		if (m) return m[1];
	}
	return null;
}

function ipToLong(ip) {
	const p = ip.split(".").map(Number);
	return ((p[0] << 24) + (p[1] << 16) + (p[2] << 8) + p[3]) >>> 0;
}

function inCidr(ipLong, cidr) {
	const [base, bitsStr] = cidr.split("/");
	if (base.includes(":")) return false; // ip6 not evaluated: miss, keep scanning
	const bits = bitsStr === undefined ? 32 : Number(bitsStr);
	if (!Number.isFinite(bits) || bits < 0 || bits > 32) return false;
	const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
	return (ipToLong(base) & mask) === (ipLong & mask);
}

async function dnsTxt(name) {
	const r = await fetch(`${DNS_API}?name=${encodeURIComponent(name)}&type=TXT`, {
		headers: { accept: "application/dns-json" },
	});
	if (!r.ok) return [];
	const j = await r.json();
	return (j.Answer || []).map((a) => String(a.data || "").replace(/"/g, "")).filter(Boolean);
}

async function dnsA(name) {
	const r = await fetch(`${DNS_API}?name=${encodeURIComponent(name)}&type=A`, {
		headers: { accept: "application/dns-json" },
	});
	if (!r.ok) return [];
	const j = await r.json();
	return (j.Answer || []).map((a) => String(a.data || "")).filter((x) => /^\d+\.\d+\.\d+\.\d+$/.test(x));
}

async function dnsMX(name) {
	const r = await fetch(`${DNS_API}?name=${encodeURIComponent(name)}&type=MX`, {
		headers: { accept: "application/dns-json" },
	});
	if (!r.ok) return [];
	const j = await r.json();
	return (j.Answer || [])
		.map((a) => String(a.data || "").split(" ")[1])
		.filter(Boolean);
}

// simplified RFC7208 evaluator: pass|fail|softfail|neutral|temperror|none
async function spfCheck(domain, ip, ctx, depth) {
	if (ctx.lookups++ > MAX_DNS_LOOKUPS) return "temperror";
	if (depth > MAX_INCLUDE_DEPTH) return "neutral";
	let texts;
	try {
		texts = await dnsTxt(domain);
	} catch (e) {
		return "temperror";
	}
	const rec = texts.find((t) => /^v=spf1\b/i.test(t));
	if (!rec) return "none";
	const ipLong = ipToLong(ip);
	const mechs = rec.trim().split(/\s+/).slice(1);
	for (const raw of mechs) {
		let qual = "+";
		let m = raw;
		if (/^[+\-~?]/.test(m)) {
			qual = m[0];
			m = m.slice(1);
		}
		const lname = m.toLowerCase();
		const hit = await (async () => {
			if (lname.startsWith("ip4:")) {
				const spec = m.slice(4);
				return spec.split(",").some((c) => inCidr(ipLong, c));
			}
			if (lname.startsWith("ip6:")) return false;
			if (lname.startsWith("include:")) {
				const inc = m.slice(8);
				const v = await spfCheck(inc, ip, ctx, depth + 1);
				return v === "pass";
			}
			if (lname === "a" || lname.startsWith("a:") || lname.startsWith("a/")) {
				const host = lname === "a" ? domain : m.slice(2).split("/")[0] || domain;
				const addrs = await dnsA(host);
				return addrs.some((a) => inCidr(ipLong, a + (m.includes("/") ? m.slice(m.indexOf("/")) : "")));
			}
			if (lname === "mx" || lname.startsWith("mx:")) {
				const hosts = await dnsMX(domain);
				for (const h of hosts.slice(0, 5)) {
					const addrs = await dnsA(h);
					if (addrs.some((a) => inCidr(ipLong, a))) return true;
				}
				return false;
			}
			if (lname.startsWith("redirect=")) {
				return false; // handled below
			}
			return false;
		})();
		if (hit) {
			if (qual === "+") return "pass";
			if (qual === "-") return "fail";
			if (qual === "~") return "softfail";
			return "neutral";
		}
	}
	const redirect = mechs.find((x) => /^redirect=/i.test(x));
	if (redirect) {
		return spfCheck(redirect.slice(9), ip, ctx, depth + 1);
	}
	const all = mechs.find((x) => /^[+\-~?]?all$/i.test(x));
	if (!all) return "neutral";
	const q = all[0];
	if (q === "-") return "fail";
	if (q === "~") return "softfail";
	if (q === "?") return "neutral";
	return "neutral";
}

// main entry: async because of DoH fallback
export async function checkOwnDomainSpoof(fromAddress, rawContent, ownDomains) {
	const domain = claimedDomain(fromAddress);
	if (!domain || ownDomains.length === 0) return { reject: false, reason: "" };

	const apex = ownDomains.includes(domain);
	const suffix = ownDomains.some((d) => domain.endsWith("." + d));
	if (!apex && !suffix) return { reject: false, reason: "" };

	const head = headBlock(rawContent || "");
	let { spf, dkim, dmarc } = headerVerdicts(head);

	// Layer 2: no usable header verdicts -> compute SPF from client-ip
	if (!spf && !dmarc) {
		const ip = clientIp(head);
		if (ip) {
			try {
				spf = await spfCheck(domain, ip, { lookups: 0 }, 0);
			} catch (e) {
				spf = "temperror";
			}
		}
	}

	if (dmarc === "fail") return { reject: true, reason: "dmarc=fail" };
	if (spf === "fail") return { reject: true, reason: "spf=fail" };

	if (
		apex &&
		(spf === "softfail" || spf === "none" || spf === "neutral") &&
		dkim !== "pass" &&
		dmarc !== "pass"
	) {
		return {
			reject: true,
			reason: `unauthenticated self-domain claim (spf=${spf},dkim=${dkim || "none"},dmarc=${dmarc || "none"})`,
		};
	}
	return { reject: false, reason: "" };
}
