import BizError from "../error/biz-error";
import orm from "../entity/orm";
import {oauth} from "../entity/oauth";
import { eq, inArray } from 'drizzle-orm';
import userService from "./user-service";
import loginService from "./login-service";
import cryptoUtils from "../utils/crypto-utils";
import KvConst from "../const/kv-const";
import { t } from "../i18n/i18n.js";
import { v4 as uuidv4 } from 'uuid';

const oauthService = {

	async bindUser(c, params) {

		const { email, oauthUserId, code, bindTicket } = params;

		// SECURITY (bounty finding #3): this endpoint has no auth middleware
		// (it lives under the /oauth exclude prefix). Previously any client could
		// PUT an arbitrary {email, oauthUserId} and mint a mailbox + JWT, since the
		// oauthUserId was fully attacker-controlled. We now require a one-time
		// bind ticket that is issued only by linuxDoLogin() after a real upstream
		// OAuth round, is bound to that exact oauthUserId, and expires in 5 minutes.
		if (!bindTicket) {
			throw new BizError(t('authExpired'), 401);
		}

		const ticketKey = KvConst.OAUTH_BIND_TICKET + oauthUserId;
		const savedTicket = await c.env.kv.get(ticketKey);

		if (!savedTicket || savedTicket !== bindTicket) {
			throw new BizError(t('authExpired'), 401);
		}

		// One-time use: consume the ticket immediately so it cannot be replayed.
		await c.env.kv.delete(ticketKey);

		const oauthRow = await this.getById(c, oauthUserId);

		if (!oauthRow) {
			throw new BizError(t('authExpired'), 401);
		}

		let userRow = await userService.selectByIdIncludeDel(c, oauthRow.userId);

		if (userRow) {
			throw new BizError('Pengguna sudah terhubung dengan alamat email')
		}

		await loginService.register(c, { email, password: cryptoUtils.genRandomPwd(), code }, true);

		userRow = await userService.selectByEmail(c, email);

		orm(c).update(oauth).set({ userId: userRow.userId }).where(eq(oauth.oauthUserId, oauthUserId)).run();
		const jwtToken = await loginService.login(c, { email, password: null }, true);

		return { userInfo: oauthRow, token: jwtToken}
	},

	async linuxDoLogin(c, params) {

		const { code } = params;

		let token = '';
		let userInfo = {}

		const reqParams = new URLSearchParams()
		reqParams.append('client_id', c.env.linuxdo_client_id)
		reqParams.append('client_secret', c.env.linuxdo_client_secret)
		reqParams.append('code', code)
		reqParams.append('redirect_uri', c.env.linuxdo_callback_url)
		reqParams.append('grant_type', 'authorization_code')

		const tokenRes = await fetch("https://connect.linux.do/oauth2/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: reqParams.toString()
		})

		if (!tokenRes.ok) {
			throw new BizError(tokenRes.statusText)
		}

		token = await tokenRes.json()

		const userRes = await fetch('https://connect.linux.do/api/user', {
			headers: {
				Authorization: 'Bearer ' + token.access_token
			}
		});

		if (!userRes.ok) {
			throw new BizError(userRes.statusText)
		}

		userInfo = await userRes.json();

		userInfo.oauthUserId = String(userInfo.id);
		userInfo.active = userInfo.active ? 0 : 1;
		userInfo.silenced = userInfo.active ? 0 : 1;
		userInfo.trustLevel = userInfo.trust_level;
		userInfo.avatar = userInfo.avatar_url;

		const  oauthRow = await this.saveUser(c, userInfo);
		const userRow = await userService.selectByIdIncludeDel(c, oauthRow.userId);

		if (!userRow) {
			// Account not yet bound. Issue a one-time, short-lived bind ticket tied
			// to THIS oauthUserId from THIS completed OAuth round. bindUser() requires
			// it, which prevents an attacker from binding an arbitrary email to an
			// oauthUserId they never authenticated as (bounty finding #3).
			const bindTicket = uuidv4();
			await c.env.kv.put(
				KvConst.OAUTH_BIND_TICKET + oauthRow.oauthUserId,
				bindTicket,
				{ expirationTtl: 300 }
			);
			return { userInfo: oauthRow, token: null, bindTicket }
		}

		const JwtToken = await loginService.login(c, { email: userRow.email, password: null }, true);
		return { userInfo: oauthRow, token: JwtToken }
	},

	async saveUser(c, userInfo) {

		const userInfoRow = await this.getById(c, userInfo.oauthUserId);

		if (!userInfoRow) {
			return await orm(c).insert(oauth).values(userInfo).returning().get();
		} else {
			return await orm(c).update(oauth).set(userInfo).where(eq(oauth.oauthUserId, userInfo.oauthUserId)).returning().get();
		}

	},

	async getById(c, oauthUserId) {
		return await orm(c).select().from(oauth).where(eq(oauth.oauthUserId, oauthUserId)).get();
	},

	async deleteByUserId(c, userId) {
		await this.deleteByUserIds(c, [userId]);
	},

	async deleteByUserIds(c, userIds) {
		await orm(c).delete(oauth).where(inArray(oauth.userId, userIds)).run();
	},

	async clearNoBindOathUser(c) {
		await orm(c).delete(oauth).where(eq(oauth.userId, 0)).run();
	},

}

export default  oauthService
