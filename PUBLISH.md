# Cloud Mail Publish Package

Sanitized source package ready for public GitHub.

## What is included
- Frontend (`mail-vue`)
- Worker backend (`mail-worker`)
- Deploy scripts (`scripts/`)
- Docs + GitHub workflow templates

## What is excluded / redacted
| Item | Status |
|------|--------|
| Production wrangler files with real IDs | excluded |
| JWT secret | redacted / placeholder |
| D1 / KV / R2 production IDs | redacted / placeholder |
| Personal domain / admin email | redacted |
| `node_modules`, `dist`, `.wrangler` | excluded |
| Deploy state / admin credentials files | excluded |

## Quick start
```bash
# 1) install deps
cd mail-vue && pnpm install && cd ..
cd mail-worker && pnpm install && cd ..

# 2) one-click deploy (recommended)
bash scripts/deploy.sh

# or copy example config and fill yourself
cp mail-worker/wrangler.example.toml mail-worker/wrangler.local.toml
# edit wrangler.local.toml, then:
# cd mail-worker && wrangler deploy -c wrangler.local.toml
```

## Important
- Do **not** put real secrets into tracked files.
- See [SECURITY.md](./SECURITY.md) before pushing.
- Original production tree on the server stays private; publish from this package only.

## Notes for your own domain
1. Set worker vars: `domain`, `admin`, `jwt_secret`
2. Optional worker var: `cors_origins=https://mail.yourdomain.com,https://yourdomain.com`
3. Update login brand footer in `mail-vue/src/views/login/index.vue` if desired
