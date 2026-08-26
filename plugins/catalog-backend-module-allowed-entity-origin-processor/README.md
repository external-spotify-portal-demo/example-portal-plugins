# Allowed Entity Origin Processor

A catalog backend module that restricts which entities can be ingested based on their kind, type, and source origin location. Use it to ensure that entities of a specific kind (e.g. `McpServer`) can only be registered from approved repositories or directories.

## Getting Started (Spotify Portal)

You can try out the module via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/catalog-backend-module-allowed-entity-origin-processor
```

Since this is a catalog backend module, Portal Studio will start a local catalog. You will need to configure catalog locations manually in your `app-config.local.yaml` and will not see entities from the production Portal instance.

## Configuration

Define restriction rules in your `app-config.yaml`. Each rule specifies a `kind` (required), an optional `type`, and a list of `allowedLocationPatterns` that the entity's origin location must match.

```yaml
catalog:
  allowedEntityOrigin:
    rules:
      - kind: API
        type: mcp-server
        allowedLocationPatterns:
          - https://github.com/myorg/mcp-servers/
      - kind: Component
        allowedLocationPatterns:
          - https://github.com/myorg/mcp-servers/
          - https://github.com/myorg/internal-tools/blob/main/mcp/
```

| Field                     | Required | Description                                                                                  |
| ------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `kind`                    | Yes      | The entity kind to restrict (e.g. `McpServer`, `Component`). Matched case-insensitively.     |
| `type`                    | No       | The entity `spec.type` to restrict. When omitted, the rule applies to all types of the kind. |
| `allowedLocationPatterns` | Yes      | URL prefixes the entity's origin location must start with for it to be allowed.              |

## Usage

When the processor runs, it checks each incoming entity against the configured rules:

- If an entity's kind (and type, if specified) matches a rule but its origin location doesn't start with any of the `allowedLocationPatterns`, ingestion is rejected with an error visible in the catalog.
- Entities that don't match any rule pass through unaffected.
- If no rules are configured, all entities pass through.
