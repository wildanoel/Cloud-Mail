<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">Cloud Mail</h1>
    <p align="center">Cloudflare Workers email service - native CF Email Service + External API + D1 backup + AI Email Agent</p>
    <p align="center">
        <a href="/LICENSE">
            <img src="https://img.shields.io/badge/license-MIT-green" />
        </a>
    </p>
</p>

## Highlights

### 1. Cloudflare Email Service

Uses the native `send_email` Workers binding for outbound email, with optional Resend fallback.

- **CF First** (default)
- **Resend Only**
- **CF Only**

### 2. External API

Send email and query status from other apps via HTTP API.

```bash
curl -X POST "https://your-domain.com/api/external/send" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "from": "App <noreply@example.com>",
    "to": "user@gmail.com",
    "subject": "Hello",
    "html": "<p>Hello world</p>"
  }'
```

Full docs: [External API Guide](docs/external-api-guide.md)

### 3. Delete + Attachment Cleanup

- Soft delete / permanent delete (including R2/S3/KV attachments)
- Batch delete via External API

### 4. AI Email Agent

- Conversational email assistant on Workers AI
- Auto-draft replies (drafts only, never auto-send)
- Send/delete require confirmation

### 5. More

- Multi-domain / multi-user / RBAC
- Attachments (R2/S3/KV)
- Telegram push / Turnstile
- Dark mode / i18n (EN/ZH/ID)
- Responsive Web UI (Vue 3 + Element Plus)

---

## Quick Start

### Prerequisites

- Cloudflare account
- Node.js 16.17+
- pnpm 8+ (recommended)
- `jq`, `python3`, `openssl`, `curl`
- Domain added to Cloudflare DNS

### One-Click Deploy (Recommended)

```bash
git clone https://github.com/wildanoel/Cloud-Mail.git
cd Cloud-Mail
bash scripts/deploy.sh
```

The script handles:

- Wrangler login check
- Idempotent D1 / KV / R2 creation
- JWT secret generation
- Optional AI Email Agent enablement
- `wrangler.toml` patching
- `wrangler deploy` (auto-builds Vue frontend)
- Schema init via `/api/init/<jwt_secret>`

**Subcommands:**

```bash
bash scripts/deploy.sh                  # interactive first-time deploy
bash scripts/deploy.sh --with-ai        # enable AI Email Agent
bash scripts/deploy.sh --no-ai          # disable AI Email Agent
bash scripts/deploy.sh --redeploy       # rebuild + ship only
bash scripts/deploy.sh --reset          # clear local state file
bash scripts/deploy.sh --destroy        # tear down Worker + D1 + KV + R2
```

### Manual Deploy

1. Clone the repo
2. Create D1 / KV / R2
3. Configure `wrangler.toml` (see `wrangler.example.toml`)
4. `cd mail-worker && wrangler deploy`
5. Visit `/api/init/<jwt_secret>`
6. Register the admin account using the email in your `admin` config

See [SECURITY.md](SECURITY.md) and [PUBLISH.md](PUBLISH.md) for publish/security notes.

---

## Stack

| Component | Tech |
|-----------|------|
| Runtime | Cloudflare Workers |
| Backend | Hono.js |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| Cache | Cloudflare KV |
| Files | Cloudflare R2 |
| Send | Cloudflare Email Service + Resend |
| Receive | Cloudflare Email Routing |
| Frontend | Vue 3 + Element Plus + Vite |

---

## License

MIT. See [LICENSE](LICENSE).
