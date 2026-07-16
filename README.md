<p align="center">
    <img src="doc/demo/logo.png" width="80px" />
    <h1 align="center">Cloud Mail</h1>
    <p align="center">Cloudflare Workers email service — native CF Email Service + External API + D1 backup + AI Email Agent</p>
    <p align="center">
        简体中文 | <a href="/README-en.md">English</a>
    </p>
    <p align="center">
        <a href="/LICENSE">
            <img src="https://img.shields.io/badge/license-MIT-green" />
        </a>
    </p>
</p>

## 功能亮点

### 1. Cloudflare Email Service 集成

使用 Cloudflare 原生 `send_email` Workers binding 发送邮件，可搭配 Resend 作为备选。

- **CF 优先模式**（默认）：先通过 Cloudflare Email Service 发送，失败自动回退 Resend
- **仅 Resend 模式**
- **仅 CF 模式**

### 2. External API

允许其他应用通过 HTTP API 发送邮件和查询状态。

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

详细文档：[External API Guide](docs/external-api-guide.md)

### 3. 邮件删除 + R2 附件清理

- 软删除 / 永久删除（含 R2/S3/KV 附件）
- External API 批量删除

### 4. AI Email Agent

- Workers AI 对话式邮件助手
- 自动起草回信（仅草稿，不会自动发送）
- 发送/删除需二次确认

### 5. 其他

- 多域名 / 多用户 / RBAC
- 附件（R2/S3/KV）
- Telegram 推送 / Turnstile
- 暗色模式 / 多语言（中/英/印尼）
- 响应式 Web UI（Vue 3 + Element Plus）

---

## 快速开始

### 环境要求

- Cloudflare 账号
- Node.js 16.17+
- pnpm 8+（推荐）
- `jq`、`python3`、`openssl`、`curl`
- 域名已添加到 Cloudflare DNS

### 一键部署（推荐）

```bash
git clone https://github.com/wildanoel/Cloud-Mail.git
cd Cloud-Mail
bash scripts/deploy.sh
```

脚本会自动完成：

- 检查 wrangler 登录状态
- 幂等创建 D1 / KV / R2
- 生成 JWT secret
- 可选启用 AI Email Agent
- 写入 `wrangler.toml` bindings + vars
- `wrangler deploy`（自动构建前端）
- 调用 `/api/init/<jwt_secret>` 初始化 schema

**子命令：**

```bash
bash scripts/deploy.sh                  # 交互式首次部署
bash scripts/deploy.sh --with-ai        # 自动启用 AI Email Agent
bash scripts/deploy.sh --no-ai          # 禁用 AI Email Agent
bash scripts/deploy.sh --redeploy       # 仅重建+部署
bash scripts/deploy.sh --reset          # 清除本地状态文件
bash scripts/deploy.sh --destroy        # 删除 Worker + D1 + KV + R2（不可恢复）
```

### 手动部署

1. 克隆仓库
2. 创建 D1 / KV / R2
3. 配置 `wrangler.toml`（可参考 `wrangler.example.toml`）
4. `cd mail-worker && wrangler deploy`
5. 访问 `/api/init/<jwt_secret>`
6. 用 `admin` 配置中的邮箱注册管理员

更多安全说明见 [SECURITY.md](SECURITY.md) 和 [PUBLISH.md](PUBLISH.md)。

---

## 技术栈

| 组件 | 技术 |
|------|------|
| 运行环境 | Cloudflare Workers |
| 后端框架 | Hono.js |
| 数据库 | Cloudflare D1 (SQLite) + Drizzle ORM |
| 缓存 | Cloudflare KV |
| 文件存储 | Cloudflare R2 |
| 发件 | Cloudflare Email Service + Resend |
| 收件 | Cloudflare Email Routing |
| 前端 | Vue 3 + Element Plus + Vite |

---

## License

MIT. 详见 [LICENSE](LICENSE)。
