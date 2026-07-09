# catalog-backend-module-app-settings-deps

A Backstage catalog processor module that automatically adds `dependsOn` relations to entities based on a JSON app-settings file.

## How it works

The processor looks for the `internal.com/app-settings` annotation on catalog entities. When present, the annotation value is treated as a path (relative to the entity's source location) pointing to a JSON settings file.

Each top-level key in that JSON file is mapped to a `dependsOn` relation targeting `component:default/<key>` (lowercased).

### Example

Given a `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    internal.com/app-settings: ./appsettings.json
spec:
  type: service
  owner: team-a
  lifecycle: production
```

And an `appsettings.json` next to it:

```json
{
  "Album": {
    "Api": {
      "BaseUrl": "https://localhost",
      "ApiKey": "1234"
    }
  },
  "User": {
    "Api": {
      "BaseUrl": "https://localhost",
      "ApiKey": "1234"
    }
  }
}
```

The processor emits two `dependsOn` relations:

- `component:default/my-service` **dependsOn** `component:default/album`
- `component:default/my-service` **dependsOn** `component:default/user`

## Installation

Add the module to your backend in `packages/backend/src/index.ts`:

```ts
backend.add(import('backstage-plugin-catalog-backend-module-app-settings-deps'));
```

No additional configuration is required. The module uses the existing SCM integrations from your Backstage config to resolve and read files from source control.
