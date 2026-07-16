import { Hono } from 'hono';
const app = new Hono();

import result from '../model/result';
import { cors } from 'hono/cors';

// ============================================================
// PATCH 1: Restricted CORS
// Configure allowed origins via env var CORS_ORIGINS (comma-separated)
// or fall back to same-origin friendly defaults.
// ============================================================
function resolveAllowedOrigins(c) {
	const fromEnv = c?.env?.cors_origins || c?.env?.CORS_ORIGINS;
	if (typeof fromEnv === 'string' && fromEnv.trim()) {
		return fromEnv.split(',').map(s => s.trim()).filter(Boolean);
	}
	// Safe defaults for local/dev. Override in production via cors_origins.
	return [
		'http://127.0.0.1:3001',
		'http://localhost:3001',
	];
}

app.use('*', async (c, next) => {
	const allowed = resolveAllowedOrigins(c);
	const origin = c.req.header('Origin');
	const allowOrigin = origin && allowed.includes(origin) ? origin : (allowed[0] || '*');

	// Apply CORS headers manually so we can use env-based origins
	if (c.req.method === 'OPTIONS') {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': allowOrigin,
				'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Max-Age': '86400',
				'Vary': 'Origin',
			},
		});
	}

	c.header('Access-Control-Allow-Origin', allowOrigin);
	c.header('Access-Control-Allow-Credentials', 'true');
	c.header('Vary', 'Origin');
	await next();
});

// Keep hono/cors import used only as fallback documentation; real CORS above.
void cors;

// ============================================================
// PATCH 2: Security Headers
// ============================================================
app.use('*', async (c, next) => {
	await next();

	c.header('X-Frame-Options', 'DENY');
	c.header('X-Content-Type-Options', 'nosniff');
	c.header('X-XSS-Protection', '1; mode=block');
	c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
	c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
	c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
	c.header('Content-Security-Policy', [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com",
		"style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
		"img-src 'self' data: blob: https:",
		"connect-src 'self' https://challenges.cloudflare.com",
		"frame-src https://challenges.cloudflare.com",
		"object-src 'none'",
		"base-uri 'self'",
		"form-action 'self'",
	].join('; '));
});

// ============================================================
// PATCH 3: Rate Limiting (IP-based, in-memory)
// ============================================================
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

app.use('/login', async (c, next) => {
	const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
	const now = Date.now();
	const record = loginAttempts.get(ip);

	if (record && record.lockedUntil > now) {
		const remaining = Math.ceil((record.lockedUntil - now) / 1000);
		return c.json(result.fail(`Too many login attempts. Try again in ${remaining}s.`, 429));
	}

	await next();

	// Only count failed attempts (after response)
	const body = await c.res.clone().json();
	if (body.code === 501) {
		if (!record || now > record.lockedUntil) {
			loginAttempts.set(ip, { count: 1, lockedUntil: 0 });
		} else {
			record.count++;
			if (record.count >= MAX_ATTEMPTS) {
				record.lockedUntil = now + LOCKOUT_MS;
			}
		}
	} else if (body.code === 200) {
		loginAttempts.delete(ip);
	}
});

// Cleanup is lazy - entries checked on access

// ============================================================
// Original error handler
// ============================================================
app.onError((err, c) => {
	if (err.name === 'BizError') {
		console.log(err.message);
	} else {
		console.error(err);
	}

	if (err.message === `Cannot read properties of undefined (reading 'get')`) {
		return c.json(result.fail('KV database not bound', 502));
	}

	if (err.message === `Cannot read properties of undefined (reading 'put')`) {
		return c.json(result.fail('KV database not bound', 502));
	}

	if (err.message === `Cannot read properties of undefined (reading 'prepare')`) {
		return c.json(result.fail('D1 database not bound', 502));
	}

	return c.json(result.fail(err.message, err.code));
});

export default app;
