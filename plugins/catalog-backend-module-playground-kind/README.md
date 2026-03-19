# @internal/backstage-plugin-catalog-backend-module-playground-kind

Playground entity kind processor for [@backstage/plugin-catalog-backend](https://www.npmjs.com/package/@backstage/plugin-catalog-backend).

This module extends the Backstage Catalog Model with a new `Playground` entity kind, representing sandbox and experimentation environments.

## Entity Shape

```yaml
apiVersion: backstage.io/v1alpha1
kind: Playground
metadata:
  name: my-sandbox
  description: My experimentation sandbox
spec:
  type: sandbox # or "experiment"
  lifecycle: active # or "expired"
  owner: user:default/jane
```

## Spec Fields

| Field       | Type   | Required | Allowed Values          | Description                      |
| ----------- | ------ | -------- | ----------------------- | -------------------------------- |
| `type`      | string | yes      | `sandbox`, `experiment` | The type of playground           |
| `lifecycle` | string | yes      | `active`, `expired`     | Current lifecycle state          |
| `owner`     | string | yes      | entity reference        | Owner (User or Group entity ref) |

## Installation

Add the module to your backend in `packages/backend/src/index.ts`:

```ts
backend.add(
  import('@internal/backstage-plugin-catalog-backend-module-playground-kind'),
);
```
