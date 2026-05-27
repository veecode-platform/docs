---
sidebar_position: 10
sidebar_label: MCP (AI Tooling)
title: MCP — AI Tooling Integration
---

DevPortal exposes an MCP (Model Context Protocol) server that lets external AI tools — Claude Code, Codex CLI, Cursor — query the catalog, read TechDocs, and execute scaffolder templates using your portal as a context source.

Two independent capabilities:

1. **MCP server for external clients** — OAuth per-user authentication, no LLM API key required
2. **AI Chat in-portal** — optional; requires an LLM API key (OpenAI, Anthropic, Gemini, or Ollama)

## For platform teams

### SaaS (customer portal)

Go to **Configure → Integrations** and open the **MCP + AI Chat** card.

1. Click **Connect**
2. The dialog opens with the default action **"Enable MCP server"**
3. (Optional) Toggle **"Also add AI Chat in portal"**
4. If AI Chat is on, select provider (OpenAI, Anthropic, Gemini, or Ollama) and provide the API key
5. Confirm — the button label reflects what will be provisioned:
   - **Enable MCP server** — MCP server only
   - **Enable MCP + AI Chat** — MCP server + in-portal chat

**What happens on confirm:**

Always:
- Provisions the MCP server for external clients
- Activates `mcp-actions-backend` + catalog, TechDocs, and scaffolder extras

If AI Chat is enabled:
- Validates the API key with the provider
- Automatically resolves a compatible model
- Activates `mcp-chat-backend` and `mcp-chat`
- Injects `mcpChat` block in app-config with provider and model

After connecting, the card shows:
- The MCP endpoint URL (e.g., `https://<instance>/api/mcp-actions/v1`)
- A switch for enabling/disabling AI Chat independently

**Disabling AI Chat only** (without disconnecting MCP):
Use the switch on the connected card. This removes `mcp-chat-backend`, `mcp-chat`, the `mcpChat:` block, and the LLM API key — without affecting the MCP server or external clients.

### Self-hosted (preset activation)

Activate the `mcp` preset (and optionally `mcp-chat`) via `VEECODE_PRESETS`:

```sh
# MCP server only — no LLM API key required
VEECODE_PRESETS=recommended,mcp

# MCP server + in-portal AI Chat
VEECODE_PRESETS=recommended,mcp,mcp-chat
MCP_CHAT_PROVIDER=openai
MCP_CHAT_API_KEY=sk-xxxx
MCP_CHAT_MODEL=gpt-5.4
```

The `mcp` preset (`presets/mcp.yaml`) has no required variables — the OAuth/DCR configuration is already baked into the base image's `app-config.production.yaml`. It enables the following plugins at boot:

- `backstage-plugin-mcp-actions-backend` (exposes `/api/mcp-actions/v1`)
- `red-hat-developer-hub-backstage-plugin-software-catalog-mcp-extras`
- `red-hat-developer-hub-backstage-plugin-techdocs-mcp-extras`
- `red-hat-developer-hub-backstage-plugin-scaffolder-mcp-extras`

The `mcp-chat` preset (`presets/mcp-chat.yaml`) requires:

| Variable | Description |
|---|---|
| `MCP_CHAT_PROVIDER` | LLM provider ID: `openai` or `claude` |
| `MCP_CHAT_API_KEY` | API key for the selected provider |
| `MCP_CHAT_MODEL` | Model name (e.g., `gpt-5.4` for openai, `claude-sonnet-4-6-latest` for claude) |

:::warning
`mcp-chat` talks loopback to `mcp-actions-backend`. Without the `mcp` preset, the MCP backend does not mount and every tool invocation in chat will fail. Always compose as `mcp,mcp-chat`.
:::

:::warning
Do not also activate `mcp-actions-backend` via a raw `dynamic-plugins.yaml` mount when using the `mcp` preset. Duplicate registration causes a boot failure: `Plugin 'mcp-actions' is already registered`.
:::

**Available toolsets:**

| `pluginSource` | Origin | Tools exposed |
|---|---|---|
| `mcp-actions` | VeeCode overlay | `explain` |
| `catalog` | Backstage built-in | `get-catalog-entity`, `validate-entity` |
| `scaffolder` | Backstage built-in | `validate-scaffolder` |
| `software-catalog-mcp-extras` | RHDH | `query-catalog-entities`, `register-entity`, `unregister-entity` |
| `techdocs-mcp-extras` | RHDH | `analyze-techdocs-coverage`, `fetch-techdocs`, `retrieve-techdocs-content` |
| `scaffolder-mcp-extras` | RHDH | `execute-template`, `fetch-template-metadata`, `list-scaffolder-tasks`, `get-scaffolder-task-logs`, `list-scaffolder-actions`, `dry-run-template` |

### OAuth / DCR configuration (self-hosted)

External clients authenticate via OAuth 2.1 with Dynamic Client Registration (DCR). This configuration is already baked into the base image when using the V2 unified image. For reference, the relevant app-config blocks are:

```yaml
auth:
  experimentalDynamicClientRegistration:
    enabled: true
    allowedRedirectUriPatterns:
      - 'http://127.0.0.1:*/callback'
      - 'http://localhost:*/callback'
  experimentalRefreshToken:
    enabled: true
    tokenLifetime: { days: 30 }
    maxRotationLifetime: { years: 1 }
    maxTokensPerUser: 20

backend:
  auth:
    dangerouslyDisableDefaultAuthPolicy: false
```

Prerequisites:
- `permission.enabled: true`
- Persistent database (Postgres) to preserve signing keys and sessions across restarts

## For developers

### Claude Code

Add to `.mcp.json` at the project root or `~/.mcp.json` globally:

```json
{
  "mcpServers": {
    "devportal": {
      "type": "http",
      "url": "https://<your-instance>/api/mcp-actions/v1"
    }
  }
}
```

Or via the CLI:

```shell
claude mcp add --transport http --scope user devportal https://<your-instance>/api/mcp-actions/v1
```

### Codex CLI

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.devportal]
url = "https://<your-instance>/api/mcp-actions/v1"
```

On first use, the client opens a browser window for the OAuth authorization flow. No manual token management is needed.

### Cursor

Add to your Cursor MCP configuration (`.cursor/mcp.json` in the project root, or the global Cursor settings under **Settings → MCP**):

```json
{
  "mcpServers": {
    "devportal": {
      "url": "https://<your-instance>/api/mcp-actions/v1"
    }
  }
}
```

On first use, Cursor triggers the OAuth authorization flow and stores the resulting token. The server will appear in the Cursor MCP panel under **Tools**.

## Advanced configuration

To customize prompts, models, or add additional MCP servers to the in-portal chat, use **Configure → App Config**:

```yaml
mcpChat:
  mcpServers:
    - id: devportal
      name: DevPortal MCP
      url: http://localhost:7007/api/mcp-actions/v1
      type: streamable-http
    - id: github
      name: GitHub MCP
      url: https://api.githubcopilot.com/mcp/
      type: streamable-http
      headers:
        Authorization: Bearer ${GITHUB_MCP_TOKEN}
```

:::note
Use `http://localhost:7007/...` (loopback) for the DevPortal MCP entry — `mcp-chat-backend` and `mcp-actions-backend` run in the same process. Do not substitute the public hostname here.
:::

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `Plugin 'mcp-actions' is already registered` on boot | Activated via both static import and dynamic plugin | Remove one of the activations |
| `401` when connecting an MCP client | Expired session or token | Re-run the OAuth authorization flow in the client |
| `405` on GET `/api/mcp-actions/v1` | Expected — MCP uses POST | Validate via an MCP client, not a browser |
| Tools missing in client | Incomplete `pluginSources` list | Review `pluginSources` in `pluginConfig` |
| AI Chat not activating in portal | Invalid API key or wrong provider | Fix the key and reapply the configuration |
| Disabling AI Chat disconnected external MCP clients | Full disconnect used instead of partial | Reconnect the card and use the AI Chat switch to disable chat only |
