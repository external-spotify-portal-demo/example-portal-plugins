export type TeamInsightsStats = {
  teamRef: string;
  ownership: {
    total: number;
    byKind: {
      component: number;
      api: number;
      resource: number;
      system: number;
    };
  };
  maturity: {
    production: number;
    experimental: number;
    deprecated: number;
  };
  docs: {
    covered: number;
    total: number;
    missingRefs: string[];
  };
  completeness: {
    withDescription: number;
    withTags: number;
    withLifecycle: number;
    total: number;
  };
};

export type DbRow = {
  team_ref: string;
  ownership_total: number;
  ownership_components: number;
  ownership_apis: number;
  ownership_resources: number;
  ownership_systems: number;
  maturity_production: number;
  maturity_experimental: number;
  maturity_deprecated: number;
  docs_covered: number;
  docs_total: number;
  docs_missing_refs: string;
  completeness_with_description: number;
  completeness_with_tags: number;
  completeness_with_lifecycle: number;
  completeness_total: number;
  updated_at: string;
};
