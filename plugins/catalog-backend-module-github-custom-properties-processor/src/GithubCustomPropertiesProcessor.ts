import { ANNOTATION_LOCATION, Entity } from '@backstage/catalog-model';
import { JsonObject } from '@backstage/types';
import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import {
  DefaultGithubCredentialsProvider,
  ScmIntegrationRegistry,
} from '@backstage/integration';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Octokit } from '@octokit/rest';
import parseGitUrl from 'git-url-parse';

export interface PropertyMapping {
  property: string;
  entityPath: string;
  prefix?: string;
}

export class GithubCustomPropertiesProcessor implements CatalogProcessor {
  private readonly credentialsProvider: DefaultGithubCredentialsProvider;

  constructor(
    private readonly integrations: ScmIntegrationRegistry,
    private readonly logger: LoggerService,
    private readonly mappings: PropertyMapping[],
  ) {
    this.credentialsProvider =
      DefaultGithubCredentialsProvider.fromIntegrations(integrations);
  }

  getProcessorName(): string {
    return 'GithubCustomPropertiesProcessor';
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    if (entity.kind !== 'Component') {
      return entity;
    }

    const location = entity.metadata.annotations?.[ANNOTATION_LOCATION];
    if (!location) {
      return entity;
    }

    const urlMatch = location.match(/^url:(.+)$/);
    if (!urlMatch) {
      return entity;
    }

    const parsed = parseGitUrl(urlMatch[1]);
    if (!parsed.owner || !parsed.name) {
      return entity;
    }

    const host = parsed.resource;
    const integration = this.integrations.github.byHost(host);
    if (!integration) {
      return entity;
    }

    try {
      const properties = await this.fetchCustomProperties(
        host,
        parsed.owner,
        parsed.name,
        integration.config.apiBaseUrl,
      );
      return this.applyProperties(entity, properties);
    } catch (error) {
      this.logger.warn(
        `Failed to fetch GitHub custom properties for ${parsed.owner}/${parsed.name}: ${error}`,
      );
      return entity;
    }
  }

  private async fetchCustomProperties(
    host: string,
    owner: string,
    repo: string,
    apiBaseUrl?: string,
  ): Promise<Map<string, string>> {
    const orgUrl = `https://${host}/${owner}`;
    const { token } = await this.credentialsProvider.getCredentials({
      url: orgUrl,
    });

    const octokit = new Octokit({
      auth: token,
      baseUrl: apiBaseUrl,
    });

    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/properties/values',
      { owner, repo },
    );

    const properties = new Map<string, string>();
    for (const prop of data) {
      if (prop.value !== null && prop.value !== undefined) {
        properties.set(prop.property_name, String(prop.value));
      }
    }
    return properties;
  }

  private applyProperties(
    entity: Entity,
    properties: Map<string, string>,
  ): Entity {
    if (this.mappings.length === 0) {
      return entity;
    }

    const result = { ...entity };

    for (const mapping of this.mappings) {
      const value = properties.get(mapping.property);
      if (value === null || value === undefined) {
        continue;
      }

      const resolved = mapping.prefix ? `${mapping.prefix}${value}` : value;
      const [segment, field] = mapping.entityPath.split('.');

      if (segment === 'spec') {
        result.spec = { ...result.spec, [field]: resolved } as JsonObject;
      } else if (segment === 'metadata') {
        result.metadata = { ...result.metadata, [field]: resolved };
      }
    }

    return result;
  }
}
