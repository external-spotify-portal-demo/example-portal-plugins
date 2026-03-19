import {
  Entity,
  parseEntityRef,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
  getCompoundEntityRef,
} from '@backstage/catalog-model';
import {
  CatalogProcessor,
  CatalogProcessorCache,
  CatalogProcessorEmit,
} from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { z } from 'zod';

const playgroundEntitySpec = z.object({
  type: z.enum(['sandbox', 'experiment']),
  lifecycle: z.enum(['active', 'expired']),
  owner: z.string().min(1),
});

export class PlaygroundEntityProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'PlaygroundEntityProcessor';
  }

  async validateEntityKind(entity: Entity): Promise<boolean> {
    if (entity.kind !== 'Playground') {
      return false;
    }

    playgroundEntitySpec.parse(entity.spec);
    return true;
  }

  async postProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    emit: CatalogProcessorEmit,
    _cache: CatalogProcessorCache,
  ): Promise<Entity> {
    if (entity.kind !== 'Playground') {
      return entity;
    }

    const selfRef = getCompoundEntityRef(entity);
    const ownerRef = parseEntityRef(entity.spec!.owner as string, {
      defaultKind: 'Group',
      defaultNamespace: selfRef.namespace,
    });

    emit({
      type: 'relation',
      relation: {
        type: RELATION_OWNED_BY,
        source: selfRef,
        target: ownerRef,
      },
    });

    emit({
      type: 'relation',
      relation: {
        type: RELATION_OWNER_OF,
        source: ownerRef,
        target: selfRef,
      },
    });

    return entity;
  }
}
