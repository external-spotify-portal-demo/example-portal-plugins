# catalog-backend-module-techdocs-auto-annotator

A catalog processor that automatically adds the `backstage.io/techdocs-ref: dir:.` annotation to entities that don't already have one, so TechDocs is enabled by default without requiring every team to add the annotation manually.

## Getting Started (Spotify Portal)

You can try out the module via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/catalog-backend-module-techdocs-auto-annotator
```

Since this is a catalog backend module, Portal Studio will start a local catalog. You will need to configure catalog locations manually in your `app-config.local.yaml` and will not see entities from the production Portal instance.

## Installation

Add the module to your backend in `packages/backend/src/index.ts`:

```ts
backend.add(
  import(
    '@internal/backstage-plugin-catalog-backend-module-techdocs-auto-annotator'
  ),
);
```

## Configuration

By default the processor targets `Component` entities only. To change which entity kinds are annotated, add this to your `app-config.yaml`:

```yaml
catalog:
  techdocsAutoAnnotator:
    kinds:
      - Component
      - API
      - System
```

Kind matching is case-insensitive. Entities that already have a `backstage.io/techdocs-ref` annotation are never modified.
