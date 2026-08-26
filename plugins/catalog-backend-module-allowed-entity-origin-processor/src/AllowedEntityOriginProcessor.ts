import { InputError } from '@backstage/errors';
import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import {
  CatalogProcessor,
  CatalogProcessorEmit,
} from '@backstage/plugin-catalog-node';

export interface AllowedEntityOriginRule {
  kind: string;
  type?: string;
  allowedLocationPatterns: string[];
}

export class AllowedEntityOriginProcessor implements CatalogProcessor {
  constructor(private readonly rules: AllowedEntityOriginRule[]) {}

  getProcessorName(): string {
    return 'AllowedEntityOriginProcessor';
  }

  async preProcessEntity(
    entity: Entity,
    _location: LocationSpec,
    _emit: CatalogProcessorEmit,
    originLocation: LocationSpec,
  ): Promise<Entity> {
    for (const rule of this.rules) {
      const kindMatch =
        entity.kind.toLowerCase() === rule.kind.toLowerCase();
      const typeMatch =
        !rule.type ||
        (entity.spec as Record<string, unknown> | undefined)?.type ===
          rule.type;

      if (kindMatch && typeMatch) {
        const allowed = rule.allowedLocationPatterns.some(pattern =>
          originLocation.target.startsWith(pattern),
        );

        if (!allowed) {
          throw new InputError(
            `Entity "${entity.metadata.name}" of kind "${entity.kind}" is not allowed from origin "${originLocation.target}"`,
          );
        }
      }
    }

    return entity;
  }
}
