import { FilterPredicate } from '@backstage/filter-predicates';

export interface Config {
  catalog?: {
    entityEnricher?: {
      rules?: Array<{
        /**
         * The dot-path on the entity to write to.
         * For map-type targets (annotations, labels), this is the parent path.
         * For direct fields, this is the full path.
         * @example "metadata.annotations"
         * @example "spec.lifecycle"
         */
        path: string;
        /**
         * The key within the map-type target.
         * Required when path points to a map (e.g. annotations, labels).
         * @example "microsoft.com/email"
         */
        key?: string;
        /**
         * A JSONata expression evaluated against the full entity.
         * The result is coerced to a string and written to the target.
         * If the expression evaluates to undefined/null, the rule is skipped.
         * For static string values, use JSONata string literal syntax: "'production'"
         * @see https://jsonata.org/
         */
        value: string;
        /**
         * Entity filter. Accepts either:
         *
         * - A string using compact syntax: space-separated `key:value` pairs,
         *   all AND-combined. Use `$exists` as value for existence checks.
         *   Example: `"kind:User metadata.annotations.github.com/user-login:$exists"`
         *
         * - An object using the standard Backstage FilterPredicate format from
         *   @backstage/filter-predicates, supporting $exists, $in, $not, $all,
         *   $any, $contains, and $hasPrefix operators.
         *
         * If omitted, the rule applies to all entities.
         */
        filter?: string | FilterPredicate;
      }>;
    };
  };
}
