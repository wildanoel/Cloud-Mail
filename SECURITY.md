# Security / publish checklist
# Keep this file updated when adding deploy configs.

## Never commit
- mail-worker/wrangler-prod.toml
- mail-worker/wrangler-prod.*.toml
- mail-worker/wrangler-deploy.toml
- mail-worker/wrangler.local.toml
- .cloud-mail-deploy.env
- .admin-credentials.txt
- Real jwt_secret values
- Real D1 database_id / KV id / R2 bucket names tied to production
- Admin email, personal domain, API tokens
- node_modules/, dist/, .wrangler/

## Safe to commit
- mail-worker/wrangler.toml (template / placeholders only)
- mail-worker/wrangler.example.toml
- mail-worker/wrangler-action.toml (uses ${ENV} placeholders)
- mail-worker/wrangler-dev.toml / wrangler-test.toml with fake IDs only
- mail-vue/.env.dev / .env.release / .env.remote (public Vite keys only)

## Before first push
1. Run secret scan for real production values (domain, admin email, jwt, CF IDs).
2. Confirm zero hits for real secrets.
3. Push from a clean clone of this publish package, not from the live deploy tree.

## After forking
1. Copy `mail-worker/wrangler.example.toml` to a local file (gitignored)
2. Or run `bash scripts/deploy.sh`
3. Set `cors_origins` worker var to your real domain(s), e.g.
   `https://mail.example.com,https://example.com`
