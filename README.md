# Portal Plugins Example

This repository is a [Backstage](https://backstage.io) Open Source app, containing a set of plugins that are compatible with [Spotify Portal](https://backstage.spotify.com/products/portal/).

## Plugins

- [catalog-backend-module-azure-devops-entity-provider](plugins/catalog-backend-module-azure-devops-entity-provider): A Backstage catalog provider that creates `Component` entities based on Azure DevOps repositories.

- [catalog-backend-module-team-insights-processor](plugins/catalog-backend-module-team-insights-processor): A Backstage catalog processor that add a `team-insights/enabled` annotation to `Group` entities of type `team`.
- [team-insights](plugins/team-insights): A Backstage plugin that displays team insights for `Group` entities of type `team`.

## Trying the Plugins

We recommend using [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) to try these plugins in Spotify Portal. Portal Studio lets you develop and preview plugins locally without needing a full backend setup.

We don't maintain an example app or backend for open source Backstage, but you're welcome to bring the plugins into your own Backstage instance.
