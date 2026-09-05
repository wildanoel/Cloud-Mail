import JwtUtils from '../utils/jwt-utils';
import constant from '../const/constant';
import { getCookie } from 'hono/cookie';

const userContext = {
	getUserId(c) {
		return c.get('user').userId;
	},

	getUser(c) {
		return c.get('user');
	},

	async getToken(c) {
		const jwt = getCookie(c, constant.TOKEN_COOKIE) || c.req.header(constant.TOKEN_HEADER);
		// SECURITY (bounty): verifyToken is async — the missing await meant this
		// returned undefined, so logout's findIndex(-1) spliced the WRONG (last)
		// session token, leaving the intended session valid and killing another.
		const payload = await JwtUtils.verifyToken(c, jwt);
		return payload ? payload.token : null;
	},
};
export default userContext;
