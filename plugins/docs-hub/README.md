# Docs Hub

A curated documentation hub plugin for Backstage, providing a single entry point for engineering guides, golden paths, and the tech radar.

## Features

- **Overview** — A landing page with cards linking to key documentation areas: getting started, team & culture, security, architecture, tooling, and support.
- **Golden Paths** — Lists all catalog entities with TechDocs, displayed as cards with owner and tag metadata.
- **Tech Radar** — Embeds the `@backstage-community/plugin-tech-radar` component to visualize technology adoption status.

## Getting started

To develop and preview this plugin locally using Portal Studio:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/docs-hub
```

See the [Portal Studio documentation](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) for more details.
