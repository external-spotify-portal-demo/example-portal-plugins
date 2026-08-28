export interface Config {
  catalog?: {
    techdocsAutoAnnotator?: {
      /**
       * Entity kinds to automatically annotate with techdocs-ref.
       * Defaults to ['Component'] if not specified.
       */
      kinds?: string[];
    };
  };
}
