import { Entity } from '@backstage/catalog-model';
import { TeamInsightsProcessor } from './TeamInsightsProcessor';

describe('TeamInsightsProcessor', () => {
  it('should add the team-insights/enabled annotation to the entity of type team', async () => {
    const processor = new TeamInsightsProcessor();
    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: {
        name: 'test',
      },
      spec: { type: 'team' },
    };
    await expect(processor.preProcessEntity(entity)).resolves.toEqual(entity);
  });

  it.each([
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: 'test' },
      spec: { type: 'team' },
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Group',
      metadata: { name: 'test' },
      spec: { type: 'organization' },
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: { name: 'test' },
      spec: { type: 'team' },
    },
    {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'test' },
      spec: { type: 'team' },
    },
  ])(
    'should not add the team-insights/enabled annotation to the entity %o',
    async ({ apiVersion, kind, metadata, spec }) => {
      const processor = new TeamInsightsProcessor();
      const entity: Entity = { apiVersion, kind, metadata, spec };
      await expect(processor.preProcessEntity(entity)).resolves.toEqual(entity);
    },
  );
});
