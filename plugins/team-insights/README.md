# team-insights

Welcome to the team-insights plugin!

This plugin adds a "Team Insights" tab and summary card to the entity page for entities of kind "Group" and type "team".

## Getting Started (Spotify Portal)

You can try out the plugin via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/team-insights
```

## Getting started (Backstage)

This plugin is not published on npm, so if you wish to try it out, you can copy the plugin's code into your Backstage app and run:

```sh
$ yarn --cwd packages/app add @internal/plugin-team-insights
```

## Development

To run the plugin in development mode, run `yarn dev` in the plugin directory.
