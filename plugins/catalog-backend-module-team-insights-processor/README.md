# Catalog Module: Team Insights Processor

A Backstage catalog processor that enables team insights functionality for `Group` entities of type `team`.

## Overview

This processor adds a minimal `team-insights/enabled` annotation to Group entities of type `team`, powering the [team-insights](../team-insights) plugin.

## Getting Started (Spotify Portal)

You can try out the module via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/catalog-backend-module-team-insights-processor
```

Since this is a catalog backend module, Portal Studio will start a local catalog. You will need to configure catalog locations manually in your `app-config.local.yaml` and will not see entities from the production Portal instance.

## Installation

This module is not published on npm, so if you wish to try it out, you can run the example app in this repository or you can copy the module code into your Backstage app and run:

```sh
$ yarn --cwd packages/backend add @internal/plugin-catalog-backend-module-team-insights-processor
```

Then add the following to `packages/backend/src/index.ts`:

```typescript
backend.add(
  import('@internal/plugin-catalog-backend-module-team-insights-processor'),
);
```
