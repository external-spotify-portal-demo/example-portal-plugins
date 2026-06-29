# Backstage Azure DevOps Entity Provider Plugin

A Backstage entity provider that automatically discovers and imports repositories from Azure DevOps organizations as Backstage entities, with configurable project-to-owner mapping.

## Features

- 🔄 Automatic discovery of all repositories across Azure DevOps projects
- 👥 Configurable mapping of projects to owners/teams
- 🎯 Filtering support for projects and repositories
- 📅 Scheduled refresh with configurable intervals
- 🏷️ Rich metadata including tags, links, and annotations
- 🔗 Owner relationships using Backstage relations

## Getting Started (Spotify Portal)

You can try out the module via [Portal Studio](https://backstage.spotify.com/docs/portal/portal-plugins/portal-studio) from the root of the repository:

```sh
npx @spotify/portal-cli@latest studio start --instance <your-instance-name> plugins/catalog-backend-module-azure-devops-entity-provider
```

Since this is a catalog backend module, Portal Studio will start a local catalog. You will need to configure catalog locations manually in your `app-config.local.yaml` and will not see entities from the production Portal instance.

## Installation

Install the plugin in your Backstage backend:

```bash
# From the root of your Backstage app
yarn --cwd packages/backend add @internal/plugin-catalog-backend-module-azure-devops-entity-provider
```

## Configuration

Add the provider configuration to your `app-config.yaml`:

```yaml
catalog:
  providers:
    azureDevOps:
      # Azure DevOps organization URL
      organizationName: 'your-org' # Required: e.g. 'your-org' for https://dev.azure.com/your-org

      # Personal Access Token with 'Code (read)' permissions
      personalAccessToken: '${AZURE_DEVOPS_TOKEN}' # Optional: if you have integrations.azure configured, you can omit this and it will be inherited from there

      # Map projects to their owners
      projectOwnerMap:
        'ProjectAlpha': 'team-frontend'
        'ProjectBeta': 'team-backend'
        'ProjectGamma': 'team-mobile'
        'LegacyProject': 'team-maintenance'

      # Optional: Schedule for refreshing (cron expression)
      # Default: every 6 hours
      schedule: '0 */6 * * *'

      # Optional: Filter projects by regex pattern
      projectFilter: '^(Project|Legacy).*'

      # Optional: Filter repositories by regex pattern
      repositoryFilter: '^(?!archive-).*'
```

## Environment Variables

Set the following environment variable:

```bash
export AZURE_DEVOPS_TOKEN="your-personal-access-token"
```

### Creating a Personal Access Token

1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Click "New Token"
3. Set the following permissions:
   - **Code**: Read
   - **Project and Team**: Read (if you want project metadata)
4. Copy the generated token and set it as the `AZURE_DEVOPS_TOKEN` environment variable

## Generated Entities

The provider creates Backstage `Component` entities with the following structure:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: project-alpha-my-service
  title: my-service
  description: Repository my-service in Azure DevOps project ProjectAlpha
  annotations:
    azure-devops.com/project-repo: ProjectAlpha/my-service
    backstage.io/managed-by-location: azure-devops:https://dev.azure.com/your-org
  tags:
    - azure-devops
    - projectalpha
  links:
    - url: https://dev.azure.com/your-org/ProjectAlpha/_git/my-service
      title: Repository
      icon: code
spec:
  type: service
  lifecycle: unknown
  owner: team-frontend
relations:
  - type: ownedBy
    targetRef: group:team-frontend
```

## Configuration Options

| Option                | Required | Description                                                                | Default         |
| --------------------- | -------- | -------------------------------------------------------------------------- | --------------- |
| `organizationName`    | Yes      | Azure DevOps organization URL                                              | -               |
| `personalAccessToken` | No       | Personal Access Token. Inherited from `integrations.azure` if not provided | -               |
| `projectOwnerMap`     | No       | Map of project names to owners                                             | -               |
| `schedule`            | No       | Cron expression for refresh schedule                                       | `'0 */6 * * *'` |
| `projectFilter`       | No       | Regex pattern to filter projects                                           | -               |
| `repositoryFilter`    | No       | Regex pattern to filter repositories                                       | -               |

## Project Owner Mapping

The `projectOwnerMap` configuration maps Azure DevOps project names to Backstage owners. Owners should be:

- Group names (prefixed with `group:` in relations)
- User names (prefixed with `user:` in relations)

Example:

```yaml
projectOwnerMap:
  'Frontend Team Project': 'team-frontend'
  'Backend Services': 'team-backend'
  'Mobile Apps': 'team-mobile'
  'Legacy System': 'john.doe' # Individual ownership
```

## Filtering

### Project Filtering

Filter which projects to include using regex patterns:

```yaml
# Only include projects starting with "Active"
projectFilter: '^Active.*'

# Exclude archived projects
projectFilter: '^(?!Archive).*'
```

### Repository Filtering

Filter which repositories to include:

```yaml
# Exclude archived repositories
repositoryFilter: '^(?!archive-).*'

# Only include services
repositoryFilter: '.*-service$'
```

## Troubleshooting

### Common Issues

1. **Authentication Error**: Verify your Personal Access Token has the correct permissions
2. **No Entities Found**: Check your project and repository filters
3. **Owner Not Found**: Ensure the owners in `projectOwnerMap` exist in your Backstage catalog

### Debugging

Enable debug logging by setting the log level in your backend configuration:

```yaml
backend:
  logging:
    level: debug
```

Look for logs with the target `AzureDevOpsEntityProvider:your-org`.

## License

This plugin is licensed under the Apache License 2.0.
