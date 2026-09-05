import app from '../hono/hono';
import result from "../model/result";
import oauthService from "../service/oauth-service";
import constant from '../const/constant';
import { setCookie } from 'hono/cookie';

// SECURITY (bounty finding #5): mirror the login flow — when an OAuth round or a
// bind produces a session JWT, deliver it as an httpOnly cookie too.
function setAuthCookie(c, token) {
	if (!token) return;
	setCookie(c, constant.TOKEN_COOKIE, token, {
		httpOnly: true,
		secure: true,
		sameSite: 'Strict',
		path: '/',
		maxAge: constant.TOKEN_EXPIRE,
	});
}

app.post('/oauth/linuxDo/login', async (c) => {
	const loginInfo = await oauthService.linuxDoLogin(c, await c.req.json());
	setAuthCookie(c, loginInfo.token);
	return c.json(result.ok(loginInfo))
});

app.put('/oauth/bindUser', async (c) => {
	const loginInfo = await oauthService.bindUser(c, await c.req.json());
	setAuthCookie(c, loginInfo.token);
	return c.json(result.ok(loginInfo))
})
