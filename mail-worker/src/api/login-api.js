import app from '../hono/hono';
import loginService from '../service/login-service';
import result from '../model/result';
import userContext from '../security/user-context';
import constant from '../const/constant';
import { setCookie, deleteCookie } from 'hono/cookie';

// SECURITY (bounty finding #5): issue the JWT as an httpOnly cookie so it can no
// longer be read from JavaScript (localStorage was XSS-readable). The token is
// still returned in the body for non-browser/API-key clients, but the browser
// client stops persisting it.
function setAuthCookie(c, token) {
	setCookie(c, constant.TOKEN_COOKIE, token, {
		httpOnly: true,
		secure: true,
		sameSite: 'Strict',
		path: '/',
		maxAge: constant.TOKEN_EXPIRE,
	});
}

app.post('/login', async (c) => {
	const token = await loginService.login(c, await c.req.json());
	setAuthCookie(c, token);
	return c.json(result.ok({ token: token }));
});

app.post('/register', async (c) => {
	const jwt = await loginService.register(c, await c.req.json());
	return c.json(result.ok(jwt));
});

app.delete('/logout', async (c) => {
	await loginService.logout(c, userContext.getUserId(c));
	deleteCookie(c, constant.TOKEN_COOKIE, { path: '/' });
	return c.json(result.ok());
});
