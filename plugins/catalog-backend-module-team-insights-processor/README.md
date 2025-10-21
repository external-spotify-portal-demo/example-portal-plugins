# Catalog Module: Team Insights Processor

A Backstage catalog processor that enables team insights functionality for `Group` entities of type `team`.

## Overview

This processor adds a minimal `team-insights/enabled` annotation to Group entities of type `team`, powering the [team-insights](../team-insights) plugin.

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
