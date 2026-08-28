import { Entity } from '@backstage/catalog-model';
import { CatalogProcessor } from '@backstage/plugin-catalog-node';

const TECHDOCS_ANNOTATION = 'backstage.io/techdocs-ref';

export class TechDocsAutoAnnotatorProcessor implements CatalogProcessor {
  constructor(private readonly kinds: string[]) {}

  getProcessorName(): string {
    return 'TechDocsAutoAnnotatorProcessor';
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    if (!this.kinds.some(k => k.toLowerCase() === entity.kind.toLowerCase())) {
      return entity;
    }

    if (entity.metadata.annotations?.[TECHDOCS_ANNOTATION]) {
      return entity;
    }

    return {
      ...entity,
      metadata: {
        ...entity.metadata,
        annotations: {
          ...entity.metadata.annotations,
          [TECHDOCS_ANNOTATION]: 'dir:.',
        },
      },
    };
  }
}
