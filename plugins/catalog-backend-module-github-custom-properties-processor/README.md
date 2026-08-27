# Catalog Module: GitHub Custom Properties Processor

A Backstage catalog processor that enriches `Component` entities with metadata from GitHub repository [custom properties](https://docs.github.com/en/organizations/managing-organization-settings/managing-custom-properties-for-repositories-in-your-organization). The mappings between GitHub custom properties and entity fields are fully configurable via `app-config.yaml`.

## Overview

When a `Component` entity has a `backstage.io/managed-by-location` annotation pointing to a GitHub repository, this processor fetches the repository's custom properties and applies the configured mappings to the entity. Properties that are missing or `null` in GitHub are skipped — existing entity values are preserved.

## Getting Started (Spotify Portal)

You can try out the module via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/catalog-backend-module-github-custom-properties-processor
```

Since this is a catalog backend module, Portal Studio will start a local catalog. You will need to configure catalog locations manually in your `app-config.local.yaml` and will not see entities from the production Portal instance.

Create an `app-config.local.yaml` at the repo root with your GitHub token and a catalog location pointing to a repo that has custom properties set:

```yaml
integrations:
  github:
    - host: github.com
      token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

catalog:
  locations:
    - type: url
      target: https://github.com/my-org/my-repo/blob/main/catalog-info.yaml
  githubCustomProperties:
    - property: teams
      entityPath: spec.owner
      prefix: 'group:default/'
    - property: type
      entityPath: spec.type
    - property: lifecycle
      entityPath: spec.lifecycle
```

## Installation

This module is not published on npm, so if you wish to try it out, you can run the example app in this repository or you can copy the module code into your Backstage app and run:

```sh
yarn --cwd packages/backend add @internal/backstage-plugin-catalog-backend-module-github-custom-properties-processor
```

Then add the following to `packages/backend/src/index.ts`:

```typescript
backend.add(
  import(
    '@internal/backstage-plugin-catalog-backend-module-github-custom-properties-processor'
  ),
);
```

## Configuration

The processor requires a GitHub integration and property mappings in your `app-config.yaml`:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

catalog:
  githubCustomProperties:
    - property: teams
      entityPath: spec.owner
      prefix: 'group:default/'
    - property: type
      entityPath: spec.type
    - property: product_relevance
      entityPath: spec.lifecycle
```

| Field        | Required | Description                                                          |
| ------------ | -------- | -------------------------------------------------------------------- |
| `property`   | Yes      | The name of the GitHub custom property to read.                      |
| `entityPath` | Yes      | The dot-path on the entity to set (e.g. `spec.owner`, `spec.type`).  |
| `prefix`     | No       | A string to prepend to the value (e.g. `group:default/` for owners). |

If no mappings are configured, the processor is a no-op.
