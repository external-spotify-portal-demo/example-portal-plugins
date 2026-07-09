import {
  CatalogProcessor,
  CatalogProcessorEmit,
  processingResult,
} from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  UrlReaderService,
  RootConfigService,
  LoggerService,
} from '@backstage/backend-plugin-api';
import { ScmIntegrations } from '@backstage/integration';

const ANNOTATION = 'internal.com/app-settings';

export class AppSettingsDepsProcessor implements CatalogProcessor {
  private readonly urlReader: UrlReaderService;
  private readonly integrations: ScmIntegrations;
  private readonly logger: LoggerService;

  constructor(
    urlReader: UrlReaderService,
    config: RootConfigService,
    logger: LoggerService,
  ) {
    this.urlReader = urlReader;
    this.integrations = ScmIntegrations.fromConfig(config);
    this.logger = logger;
  }

  getProcessorName(): string {
    return 'AppSettingsDepsProcessor';
  }

  async preProcessEntity(
    entity: Entity,
    location: LocationSpec,
    emit: CatalogProcessorEmit,
  ): Promise<Entity> {
    const settingsPath = entity.metadata.annotations?.[ANNOTATION];
    if (!settingsPath) {
      return entity;
    }

    let settings: Record<string, unknown>;
    try {
      const resolvedUrl = this.integrations.resolveUrl({
        url: settingsPath,
        base: location.target,
      });

      const response = await this.urlReader.readUrl(resolvedUrl);
      const buffer = await response.buffer();
      settings = JSON.parse(buffer.toString());
    } catch (error) {
      this.logger.warn(
        `Failed to read app-settings for ${entity.metadata.name}: ${error}`,
      );
      return entity;
    }

    for (const name of Object.keys(settings)) {
      emit(
        processingResult.relation({
          type: 'dependsOn',
          source: {
            kind: entity.kind,
            namespace: entity.metadata.namespace ?? 'default',
            name: entity.metadata.name,
          },
          target: {
            kind: 'Component',
            namespace: 'default',
            name: name.toLowerCase(),
          },
        }),
      );
    }

    return entity;
  }
}
