export interface Config {
  catalog?: {
    /**
     * Mappings from GitHub repository custom properties to entity fields.
     */
    githubCustomProperties?: Array<{
      /** The name of the GitHub custom property. */
      property: string;
      /** The dot-path on the entity to set (e.g. "spec.owner", "spec.lifecycle"). */
      entityPath: string;
      /** Optional prefix to prepend to the property value (e.g. "group:default/"). */
      prefix?: string;
    }>;
  };
}
