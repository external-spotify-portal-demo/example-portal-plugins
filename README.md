# Portal Plugins Example

This repository is a [Backstage](https://backstage.io) Open Source app, containing a set of plugins that are compatible with [Spotify Portal](https://backstage.spotify.com/products/portal/).

## Plugins

- [catalog-backend-module-team-insights-processor](plugins/catalog-backend-module-team-insights-processor): A Backstage catalog processor that add a `team-insights/enabled` annotation to `Group` entities of type `team`.
- [team-insights](plugins/team-insights): A Backstage plugin that displays team insights for `Group` entities of type `team`.

## Running the Backstage Example app

```sh
yarn install
yarn start
```
