import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  evaluateFilterPredicate,
  FilterPredicate,
} from '@backstage/filter-predicates';
import { LoggerService } from '@backstage/backend-plugin-api';
import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import jsonataModule from 'jsonata';

// Handle ESM/CJS interop — jsonata's default export may be wrapped in a module object
const jsonata = (
  typeof jsonataModule === 'function'
    ? jsonataModule
    : (jsonataModule as any).default
) as typeof jsonataModule;

/**
 * Parse a compact filter string into a FilterPredicate.
 *
 * Format: space-separated conditions of `key:value`.
 * - `kind:User` → equality match
 * - `metadata.annotations.github.com/user-login:$exists` → existence check
 * - `kind:Component,API` → matches any of the comma-separated values
 *
 * All conditions are AND-combined.
 */
export function parseFilterString(filter: string): FilterPredicate {
  const conditions: Record<string, unknown> = {};

  for (const token of filter.split(/\s+/).filter(Boolean)) {
    const colonIndex = token.indexOf(':');
    if (colonIndex === -1) {
      throw new Error(
        `Invalid filter token "${token}": expected "key:value" format`,
      );
    }

    const key = token.slice(0, colonIndex);
    const value = token.slice(colonIndex + 1);

    if (value === '$exists') {
      conditions[key] = { $exists: true };
    } else if (value.includes(',')) {
      conditions[key] = { $in: value.split(',').filter(Boolean) };
    } else {
      conditions[key] = value;
    }
  }

  return conditions as FilterPredicate;
}

export interface TransformerRule {
  path: string;
  key?: string;
  value: string;
  filter?: FilterPredicate | string;
}

export class EntityTransformerProcessor implements CatalogProcessor {
  private readonly compiled: Array<{
    rule: TransformerRule;
    filter?: FilterPredicate;
    expression: jsonataModule.Expression;
  }>;

  private readonly logger?: LoggerService;

  constructor(
    rules: TransformerRule[],
    options: { logger?: LoggerService } = {},
  ) {
    this.logger = options.logger;
    this.compiled = rules.map(rule => {
      let filter: FilterPredicate | undefined;
      try {
        filter =
          typeof rule.filter === 'string'
            ? parseFilterString(rule.filter)
            : rule.filter;
      } catch (err: any) {
        throw new Error(
          `Failed to parse filter for "${rule.key ?? rule.path}": ${
            err.message
          }`,
        );
      }

      try {
        return {
          rule,
          filter,
          expression: jsonata(rule.value),
        };
      } catch (err: any) {
        const message = err?.message ?? JSON.stringify(err);
        throw new Error(
          `Failed to compile JSONata expression for "${
            rule.key ?? rule.path
          }": ${message}`,
        );
      }
    });
  }

  getProcessorName(): string {
    return 'EntityTransformerProcessor';
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    let result = entity;

    for (const { rule, filter, expression } of this.compiled) {
      if (filter && !evaluateFilterPredicate(filter, entity)) {
        continue;
      }

      let resolved;
      try {
        resolved = await expression.evaluate(entity);
      } catch (err: any) {
        const message = err?.message ?? JSON.stringify(err);
        const code = err?.code ? `${err.code}: ` : '';
        this.logger?.warn(
          `Skipping rule "${rule.key ?? rule.path}" on ${stringifyEntityRef(
            entity,
          )}: failed to evaluate JSONata expression: ${code}${message}`,
        );
        continue;
      }
      if (resolved === undefined || resolved === null) {
        continue;
      }

      const value = String(resolved);
      result = this.applyRule(result, rule, value);
    }

    return result;
  }

  private applyRule(
    entity: Entity,
    rule: TransformerRule,
    value: string,
  ): Entity {
    if (rule.key) {
      return this.applyMapField(entity, rule.path, rule.key, value);
    }
    return this.applyDirectField(entity, rule.path, value);
  }

  private applyMapField(
    entity: Entity,
    path: string,
    key: string,
    value: string,
  ): Entity {
    const segments = path.split('.');
    const map = this.getNestedValue(entity, segments) as
      | Record<string, string>
      | undefined;

    return this.setNestedValue(entity, segments, {
      ...map,
      [key]: value,
    });
  }

  private applyDirectField(
    entity: Entity,
    path: string,
    value: string,
  ): Entity {
    const segments = path.split('.');
    return this.setNestedValue(entity, segments, value);
  }

  private getNestedValue(obj: any, segments: string[]): any {
    let current = obj;
    for (const segment of segments) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[segment];
    }
    return current;
  }

  private setNestedValue(obj: any, segments: string[], value: any): any {
    if (segments.length === 0) {
      return value;
    }

    const [head, ...rest] = segments;
    return {
      ...obj,
      [head]: this.setNestedValue(obj?.[head] ?? {}, rest, value),
    };
  }
}
