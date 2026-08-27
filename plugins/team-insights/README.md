# team-insights

Welcome to the team-insights plugin!

This plugin adds a "Team Insights" tab and summary card to the entity page for entities of kind "Group" and type "team", showing ownership, software maturity, documentation coverage, and catalog completeness metrics.

Data is fetched from the [team-insights-backend](../team-insights-backend) plugin.

## Getting Started (Spotify Portal)

You can try out the plugin via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository.

To start both the frontend and backend together:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/team-insights*
```

Or start the frontend plugin alone (will need a running backend separately):

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/team-insights
```

## Getting started (Backstage)

This plugin is not published on npm, so if you wish to try it out, you can copy the plugin's code into your Backstage app and run:

```sh
$ yarn --cwd packages/app add @internal/plugin-team-insights
```

You will also need to install the [team-insights-backend](../team-insights-backend) plugin in your backend.

## Development

To run the plugin in development mode, run `yarn dev` in the plugin directory.
