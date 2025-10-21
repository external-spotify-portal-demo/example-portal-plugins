import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';

export class TeamInsightsProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'TeamInsightsProcessor';
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    if (entity.kind === 'Group' && entity.spec?.type === 'team') {
      if (!entity.metadata.annotations) {
        entity.metadata.annotations = {};
      }
      entity.metadata.annotations['team-insights/enabled'] = 'true';
    }
    return entity;
  }
}
