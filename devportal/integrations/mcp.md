---
sidebar_position: 7
sidebar_label: MCP Actions
title: Expose DevPortal tools to AI clients
---

MCP Actions runs an MCP server inside DevPortal 3.x that lets external AI clients use catalog, scaffolder, TechDocs, and Kubernetes tools. AI clients connect over HTTP with a static token. This page covers MCP Actions only.

## Install the MCP server

The `mcp-actions-backend` module is a Marketplace plugin. Install it from the Extensions page, or add this entry to an operator plugin file (see [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md)):

```yaml
plugins:
  - package: oci://quay.io/veecode/backstage-plugin-mcp-actions-backend@sha256:d4d24e08d7630eb352fa7e6dc1da797ebc4e667aba347575dd94d4bcde82e8e2
    disabled: false
    pluginConfig:
      backend:
        auth:
          externalAccess:
            - type: static
              options:
                token: ${MCP_TOKEN}
                subject: mcp-clients
```

Set `MCP_TOKEN` to a long random value of your choice (at least 8 characters) and pass it as an environment variable on the `devportal` service in a Compose override, or through a Kubernetes Secret referenced with `${...}`. The token goes in the `Authorization: Bearer <token>` header of every MCP client request. Anyone holding it can call the MCP tools, so treat it as a secret.

## Add tool extras

The tool sets for each domain come from separate Marketplace modules. Install the ones you want from the Extensions page, or add their entries to the same operator plugin file:

```yaml
plugins:
  - package: oci://quay.io/veecode/red-hat-developer-hub-backstage-plugin-software-catalog-mcp-extras@sha256:908e807eb7733d34cd5c1bb2061df41905ac8565c17ba46c7eea63c94c02ca5d
    disabled: false
  - package: oci://quay.io/veecode/red-hat-developer-hub-backstage-plugin-techdocs-mcp-extras@sha256:f8ddd8242bab97849548c5acdb212c98bd979b19948279122fc116d40f910947
    disabled: false
  - package: oci://quay.io/veecode/red-hat-developer-hub-backstage-plugin-scaffolder-mcp-extras@sha256:43bed3ca2ed9f8b737d8c4a58f99260a35fc853013183969140e55cc3af62098
    disabled: false
  - package: oci://quay.io/veecode/red-hat-developer-hub-backstage-plugin-kubernetes-mcp-extras@sha256:1a75f47882b587fca47c5fb509814115c89ef6fcafa7f50e027e4abb041bbc4f
    disabled: false
```

The extras register their tools with the MCP server:

- `software-catalog-mcp-extras`: query catalog entities and their metadata.
- `techdocs-mcp-extras`: read TechDocs documentation.
- `scaffolder-mcp-extras`: scaffolder tools.
- `kubernetes-mcp-extras`: Kubernetes tools.

Recreate the stack after changing the operator file so the installer picks the entries up (see [Configure dynamic plugins for the local stack](../installation-guide/docker-local/custom-plugins.md)).

## Connect a client

The MCP server uses streamable HTTP at `http(s)://<portal-host>/api/mcp-actions/v1`.

Check your MCP client's documentation for which endpoint style it needs. Authenticate with the static token in the `Authorization` header.

Example client configuration, with `<portal-host>` replaced by your portal address and `<token>` by the `MCP_TOKEN` value:

```json
{
  "mcpServers": {
    "devportal-actions": {
      "url": "https://<portal-host>/api/mcp-actions/v1",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```


## Troubleshooting

- Client gets `401 Unauthorized`: the `Authorization` header is missing or the token does not match `MCP_TOKEN`. Confirm the environment variable reached the backend.
- No tools listed: the extras modules are not installed or the stack was not recreated after adding them. Check the install service logs for their entries.
- Connection refused on the local stack: use the published portal address and port (`DEVPORTAL_PORT`), not the container-internal address.
