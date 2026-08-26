/**
 * @param {import('knex').Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable('team_insights_stats', table => {
    table.string('team_ref', 255).primary();
    table.integer('ownership_total').notNullable();
    table.integer('ownership_components').notNullable();
    table.integer('ownership_apis').notNullable();
    table.integer('ownership_resources').notNullable();
    table.integer('ownership_systems').notNullable();
    table.integer('maturity_production').notNullable();
    table.integer('maturity_experimental').notNullable();
    table.integer('maturity_deprecated').notNullable();
    table.integer('docs_covered').notNullable();
    table.integer('docs_total').notNullable();
    table.text('docs_missing_refs').notNullable();
    table.integer('completeness_with_description').notNullable();
    table.integer('completeness_with_tags').notNullable();
    table.integer('completeness_with_lifecycle').notNullable();
    table.integer('completeness_total').notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param {import('knex').Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTable('team_insights_stats');
};
