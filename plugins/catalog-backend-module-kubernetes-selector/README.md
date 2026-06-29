# @internal/backstage-plugin-catalog-backend-module-kubernetes-selector

A catalog processor module that automatically sets the `backstage.io/kubernetes-label-selector` annotation on `Component` entities that don't already have one.

When the annotation is missing, the processor sets it to `backstage.io/kubernetes-id=<entity-name>`, which enables the Kubernetes plugin to discover workloads associated with the component without requiring manual annotation in every `catalog-info.yaml`.

## How it works

The `KubernetesSelectorProcessor` runs during catalog entity pre-processing:

1. Skips any entity that is not a `Component`.
2. Skips any `Component` that already has a `backstage.io/kubernetes-label-selector` annotation (manual values are never overwritten).
3. For all other components, sets the annotation to `backstage.io/kubernetes-id=<metadata.name>`.

## Getting Started (Spotify Portal)

You can try out the module via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/catalog-backend-module-kubernetes-selector
```

Since this is a catalog backend module, Portal Studio will start a local catalog. You will need to configure catalog locations manually in your `app-config.local.yaml` and will not see entities from the production Portal instance.

## Getting Started (Backstage)

Add the module to your backend in `packages/backend/src/index.ts`:

```ts
backend.add(
  import(
    '@internal/backstage-plugin-catalog-backend-module-kubernetes-selector'
  ),
);
```

No additional configuration is needed.
