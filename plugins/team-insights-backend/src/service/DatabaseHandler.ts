import type { Knex } from 'knex';
import type { TeamInsightsStats, DbRow } from '../types';

const TABLE = 'team_insights_stats';

export class DatabaseHandler {
  constructor(private readonly knex: Knex) {}

  async getAll(): Promise<TeamInsightsStats[]> {
    const rows = await this.knex<DbRow>(TABLE).select('*');
    return rows.map(row => this.rowToStats(row));
  }

  async getByTeamRef(teamRef: string): Promise<TeamInsightsStats | undefined> {
    const row = await this.knex<DbRow>(TABLE)
      .where({ team_ref: teamRef })
      .first();
    return row ? this.rowToStats(row) : undefined;
  }

  async upsert(stats: TeamInsightsStats): Promise<void> {
    const row = this.statsToRow(stats);
    await this.knex<DbRow>(TABLE)
      .insert(row)
      .onConflict('team_ref')
      .merge();
  }

  async getCount(): Promise<number> {
    const result = await this.knex(TABLE).count({ count: '*' }).first();
    return Number(result?.count ?? 0);
  }

  private rowToStats(row: DbRow): TeamInsightsStats {
    return {
      teamRef: row.team_ref,
      ownership: {
        total: row.ownership_total,
        byKind: {
          component: row.ownership_components,
          api: row.ownership_apis,
          resource: row.ownership_resources,
          system: row.ownership_systems,
        },
      },
      maturity: {
        production: row.maturity_production,
        experimental: row.maturity_experimental,
        deprecated: row.maturity_deprecated,
      },
      docs: {
        covered: row.docs_covered,
        total: row.docs_total,
        missingRefs: JSON.parse(row.docs_missing_refs),
      },
      completeness: {
        withDescription: row.completeness_with_description,
        withTags: row.completeness_with_tags,
        withLifecycle: row.completeness_with_lifecycle,
        total: row.completeness_total,
      },
    };
  }

  private statsToRow(stats: TeamInsightsStats): Omit<DbRow, 'updated_at'> {
    return {
      team_ref: stats.teamRef,
      ownership_total: stats.ownership.total,
      ownership_components: stats.ownership.byKind.component,
      ownership_apis: stats.ownership.byKind.api,
      ownership_resources: stats.ownership.byKind.resource,
      ownership_systems: stats.ownership.byKind.system,
      maturity_production: stats.maturity.production,
      maturity_experimental: stats.maturity.experimental,
      maturity_deprecated: stats.maturity.deprecated,
      docs_covered: stats.docs.covered,
      docs_total: stats.docs.total,
      docs_missing_refs: JSON.stringify(stats.docs.missingRefs),
      completeness_with_description: stats.completeness.withDescription,
      completeness_with_tags: stats.completeness.withTags,
      completeness_with_lifecycle: stats.completeness.withLifecycle,
      completeness_total: stats.completeness.total,
    };
  }
}
