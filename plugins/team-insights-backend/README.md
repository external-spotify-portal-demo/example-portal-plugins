# Team Insights Backend

The backend for the [team-insights](../team-insights) frontend plugin. Stores and serves team health metrics across four dimensions: ownership, software maturity, documentation coverage, and catalog completeness.

## Overview

The plugin provides a REST API for team insights data:

- `GET /stats` — returns stats for all teams
- `GET /stats/:teamRef` — returns stats for a single team
- `PUT /stats/:teamRef` — upserts stats for a team

Data is stored in a database (SQLite in dev, Postgres in production) and seeded with example data on first startup.

## Getting Started (Spotify Portal)

You can try out the plugin via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/team-insights-backend
```

Since this is a backend plugin, Portal Studio will start a local backend. You will not see data from the production Portal instance — the plugin seeds its own example data on startup.

## Installation

This plugin is not published on npm, so if you wish to try it out, you can run the example app in this repository or you can copy the plugin code into your Backstage app and run:

```sh
$ yarn --cwd packages/backend add @internal/backstage-plugin-team-insights-backend
```

Then add the following to `packages/backend/src/index.ts`:

```typescript
backend.add(import('@internal/backstage-plugin-team-insights-backend'));
```

## Development

To run the plugin in development mode, run `yarn start` in the plugin directory. This starts a standalone backend server useful for developing the plugin itself.

If you want to run the entire project, including the frontend, run `yarn start` from the root directory.
