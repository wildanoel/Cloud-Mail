import s3Service from './s3-service';
import settingService from './setting-service';
import kvObjService from './kv-obj-service';

const r2Service = {

	async storageType(c) {

		const setting = await settingService.query(c);
		const { bucket, endpoint, s3AccessKey, s3SecretKey } = setting;

		if (!!(bucket && endpoint && s3AccessKey && s3SecretKey)) {
			return 'S3';
		}

		if (c.env.r2) {
			return 'R2';
		}

		return 'KV';
	},

	async putObj(c, key, content, metadata) {

		const storageType = await this.storageType(c);

		if (storageType === 'KV') {
			await kvObjService.putObj(c, key, content, metadata);
		}

		if (storageType === 'R2') {
			await c.env.r2.put(key, content, {
				httpMetadata: { ...metadata }
			});
		}

		if (storageType === 'S3') {
			await s3Service.putObj(c, key, content, metadata);
		}

	},

	async getObj(c, key) {
		return await c.env.r2.get(key);
	},

	// Serve a stored object as an HTTP Response, reading from whichever backend
	// actually holds it. BUGFIX: the /attachments/ and /static/ routes previously
	// always read from KV, so when storage was R2 (or S3) downloads returned an
	// empty 0-byte body ("Menerima data..." hangs). Dispatch on storageType so
	// the read backend matches the write backend used in putObj().
	async toObjResp(c, key) {

		const storageType = await this.storageType(c);

		if (storageType === 'R2') {
			const obj = await c.env.r2.get(key);
			if (!obj) {
				return new Response(null, { status: 404 });
			}
			const headers = new Headers();
			obj.writeHttpMetadata(headers);
			headers.set('Content-Length', obj.size);
			if (!headers.has('Content-Type')) {
				headers.set('Content-Type', 'application/octet-stream');
			}
			return new Response(obj.body, { headers });
		}

		// S3-backed objects are served directly from their public/OSS domain by
		// the frontend, so the /attachments/ worker route is only hit for R2/KV.
		// Fall back to KV for anything else to preserve the original behaviour.
		return await kvObjService.toObjResp(c, key);
	},

	async delete(c, key) {

		const storageType = await this.storageType(c);

		if (storageType === 'KV') {
			await kvObjService.deleteObj(c, key);
		}

		if (storageType === 'R2') {
			await c.env.r2.delete(key);
		}

		if (storageType === 'S3'){
			await s3Service.deleteObj(c, key);
		}

	}

};
export default r2Service;
