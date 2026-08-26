# Portal Plugins Example

This repository is a [Backstage](https://backstage.io) Open Source app, containing a set of plugins that are compatible with [Spotify Portal](https://backstage.spotify.com/products/portal/).

## Plugins

- [catalog-backend-module-allowed-entity-origin-processor](plugins/catalog-backend-module-allowed-entity-origin-processor): A catalog processor that restricts entity ingestion based on kind, type, and source origin location.
- [catalog-backend-module-azure-devops-entity-provider](plugins/catalog-backend-module-azure-devops-entity-provider): A catalog provider that creates `Component` entities based on Azure DevOps repositories.
- [catalog-backend-module-kubernetes-selector](plugins/catalog-backend-module-kubernetes-selector): A catalog processor that automatically sets the `backstage.io/kubernetes-label-selector` annotation on `Component` entities.
- [catalog-backend-module-playground-kind](plugins/catalog-backend-module-playground-kind): A catalog processor that extends the catalog model with a `Playground` entity kind.
- [catalog-backend-module-team-insights-processor](plugins/catalog-backend-module-team-insights-processor): A catalog processor that adds a `team-insights/enabled` annotation to `Group` entities of type `team`.
- [docs-hub](plugins/docs-hub): A curated documentation hub plugin providing a single entry point for engineering guides, golden paths, and the tech radar.
- [team-insights](plugins/team-insights): A plugin that displays team insights for `Group` entities of type `team`.

## Trying the Plugins

We recommend using [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) to try these plugins in Spotify Portal. Portal Studio lets you develop and preview plugins locally without needing a full backend setup.

We don't maintain an example app or backend for open source Backstage, but you're welcome to bring the plugins into your own Backstage instance.
