# Catalog Module: Entity Enricher Processor

A Backstage catalog processor that enriches entities with new field values — annotations, labels, or spec fields — using [JSONata](https://jsonata.org/) expressions defined in `app-config.yaml`. Entity filtering uses the standard Backstage `FilterPredicate` format from `@backstage/filter-predicates`.

## Overview

During catalog processing, each entity is evaluated against the configured rules. For each rule, the processor checks whether the entity matches the optional filter, evaluates the JSONata expression against the entity, and writes the result to the specified target path. Rules are applied in order, and if a JSONata expression evaluates to `undefined` or `null`, the rule is skipped for that entity.

## Getting Started (Spotify Portal)

You can try out the module via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/catalog-backend-module-entity-enricher-processor
```

Since this is a catalog backend module, Portal Studio will start a local catalog. You will need to configure catalog locations manually in your `app-config.local.yaml` and will not see entities from the production Portal instance.

Create an `app-config.local.yaml` at the repo root with a catalog location and enrichment rules. This example rule takes a Component's `spec.owner` (e.g. `group:default/platform`) and adds an `example.com/owner-name` annotation with just the team name (e.g. `platform`):

```yaml
catalog:
  locations:
    - type: url
      target: https://github.com/my-org/my-repo/blob/main/catalog-info.yaml
  entityEnricher:
    rules:
      - path: metadata.annotations
        key: example.com/owner-name
        filter: 'kind:Component spec.owner:$exists'
        value: |-
          $substringAfter(spec.owner, "group:default/")
```

Given this input entity:

```yaml
kind: Component
metadata:
  name: my-service
spec:
  owner: group:default/platform
```

The processor produces:

```yaml
kind: Component
metadata:
  name: my-service
  annotations:
    example.com/owner-name: platform
spec:
  owner: group:default/platform
```

## Installation

Add the module to your backend in `packages/backend/src/index.ts`:

```ts
backend.add(
  import(
    '@internal/backstage-plugin-catalog-backend-module-entity-enricher-processor'
  ),
);
```

## Configuration

Define enrichment rules under `catalog.entityEnricher.rules` in your `app-config.yaml`:

```yaml
catalog:
  entityEnricher:
    rules:
      # Derive a Microsoft email from a GitHub login
      - path: metadata.annotations
        key: microsoft.com/email
        filter: 'kind:User metadata.annotations.github.com/user-login:$exists'
        value: |-
          $replace($trim($replace(metadata.annotations.`github.com/user-login`, /am$/, "")), "-", ".") & "@example.com"

      # Set a label from the owner ref
      - path: metadata.labels
        key: team
        filter: 'spec.owner:$exists'
        value: |-
          $substringAfter(spec.owner, "group:default/")

      # Set a direct spec field for all Components
      - path: spec.lifecycle
        filter: 'kind:Component'
        value: |-
          "production"
```

### Rule fields

| Field    | Required | Description                                                                                                                           |
| -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `path`   | Yes      | Dot-path on the entity to write to. For map targets (annotations, labels), this is the parent path. For direct fields, the full path. |
| `key`    | No       | Key within the map target. Required when `path` points to a map like `metadata.annotations` or `metadata.labels`.                     |
| `value`  | Yes      | A [JSONata](https://jsonata.org/) expression evaluated against the full entity. The result is coerced to a string.                    |
| `filter` | No       | Entity filter — string or object (see below). If omitted, the rule applies to all entities.                                           |

If no rules are configured, the processor is a no-op.

### Behavior

- If the JSONata expression evaluates to `undefined` or `null`, the rule is skipped.
- If the target field/key already has a value, it **is** overwritten by the new value.
- For map targets (`metadata.annotations`, `metadata.labels`), only the specified `key` is set — all other existing entries in the map are preserved.
- For direct field targets (`spec.lifecycle`, `spec.owner`), the field is replaced entirely.
- Rules are applied in the order they are defined.

### Filtering

Filters use Backstage [entity predicate queries](https://backstage.io/docs/features/software-catalog/catalog-customization#entity-predicate-queries) and can be specified in two formats:

#### String format (compact)

Space-separated `key:value` pairs, all AND-combined. Use `$exists` as the value for existence checks:

```yaml
# Single condition
filter: "kind:User"

# Multiple AND conditions
filter: "kind:User metadata.annotations.github.com/user-login:$exists"

# Kind + type
filter: "kind:Component spec.type:service"
```

#### Object format (advanced)

Uses the standard Backstage `FilterPredicate` format from `@backstage/filter-predicates`, supporting `$exists`, `$in`, `$not`, `$all`, `$any`, `$contains`, and `$hasPrefix` operators:

```yaml
filter:
  kind: User
  metadata.annotations.github.com/user-login:
    $exists: true

# OR conditions
filter:
  $any:
    - { spec.type: service }
    - { spec.type: website }

# Negation
filter:
  $not: { kind: User }

# Multiple allowed values
filter:
  kind: Component
  spec.type:
    $in: [service, website]
```

### Static string values

JSONata treats unquoted words as field paths. To set a static string value, use JSONata string literal syntax. Use a YAML block scalar (`|-`) to avoid quoting conflicts:

```yaml
# Correct — sets lifecycle to the string "production"
- path: spec.lifecycle
  value: |-
    "production"

# Wrong — tries to read a field called "production" from the entity
- path: spec.lifecycle
  value: production
```

### JSONata quick reference

The full entity is the expression's input context. Common patterns:

| Expression                                                   | Result (given `spec.owner: "user:default/jdoe"`) |
| ------------------------------------------------------------ | ------------------------------------------------ |
| `spec.owner`                                                 | `user:default/jdoe`                              |
| `$substringAfter(spec.owner, "user:default/")`               | `jdoe`                                           |
| `$substringAfter(spec.owner, "user:default/") & "@acme.com"` | `jdoe@acme.com`                                  |
| `$uppercase(metadata.name)`                                  | `MY-SERVICE`                                     |
| `$replace(metadata.name, "service-", "")`                    | (removes `service-` prefix)                      |
| `"production"`                                               | `production` (static string)                     |

See the [JSONata documentation](https://docs.jsonata.org/) for the full function library.
