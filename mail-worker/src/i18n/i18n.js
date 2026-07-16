import i18next from 'i18next';
import en from './en.js'
import id from './id.js'
import app from '../hono/hono';

// Force English UI/API messages. Never follow Accept-Language into zh.
const ALLOWED = new Set(['en', 'id'])
const resolveLang = (c) => {
	const raw = (c.req.header('accept-language') || 'en').split(',')[0].trim().toLowerCase()
	const base = raw.split('-')[0]
	if (ALLOWED.has(base)) return base
	return 'en'
}

app.use('*', async (c, next) => {
	i18next.changeLanguage(resolveLang(c))
	return await next()
})

const resources = {
	en: {
		translation: en
	},
	id: {
		translation: id,
	},
};

i18next.init({
	lng: 'en',
	fallbackLng: 'en',
	resources,
});

export const t = (key, values) => i18next.t(key, values)

export default i18next;
