export interface Config {
  catalog?: {
    allowedEntityOrigin?: {
      rules?: Array<{
        /**
         * The entity kind to restrict (e.g. "McpServer", "Component").
         * Matched case-insensitively.
         */
        kind: string;
        /**
         * Optional entity spec type to restrict (e.g. "mcp-server").
         * When omitted, the rule applies to all types of the given kind.
         */
        type?: string;
        /**
         * List of allowed origin location prefixes.
         * An entity's origin location target must start with one of these
         * patterns for it to be allowed.
         * @visibility backend
         */
        allowedLocationPatterns: string[];
      }>;
    };
  };
}
