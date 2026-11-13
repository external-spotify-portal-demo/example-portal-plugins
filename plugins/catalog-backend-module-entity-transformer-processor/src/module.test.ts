import { mockServices, startTestBackend } from '@backstage/backend-test-utils';
import { catalogProcessingExtensionPoint } from '@backstage/plugin-catalog-node';
import { catalogModuleEntityTransformerProcessor } from './module';
import { EntityTransformerProcessor } from './EntityTransformerProcessor';

describe('catalogModuleEntityTransformerProcessor', () => {
  it('reads rules from both catalog.entityTransformer and the deprecated catalog.entityEnricher', async () => {
    const addProcessor = jest.fn();

    await startTestBackend({
      extensionPoints: [[catalogProcessingExtensionPoint, { addProcessor }]],
      features: [
        catalogModuleEntityTransformerProcessor,
        mockServices.rootConfig.factory({
          data: {
            catalog: {
              entityTransformer: {
                rules: [
                  {
                    path: 'metadata.labels',
                    key: 'from',
                    value: "'transformer'",
                    filter: 'kind:component',
                  },
                  {
                    path: 'spec.lifecycle',
                    value: "'from-transformer'",
                  },
                ],
              },
              entityEnricher: {
                rules: [
                  {
                    path: 'metadata.annotations',
                    key: 'example.com/from',
                    value: "'enricher'",
                  },
                  {
                    path: 'spec.lifecycle',
                    value: "'from-enricher'",
                  },
                ],
              },
            },
          },
        }),
      ],
    });

    const processor: EntityTransformerProcessor = addProcessor.mock.calls[0][0];
    const result = await processor.preProcessEntity({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'my-service' },
      spec: {},
    });

    expect(result.metadata.labels).toEqual({ from: 'transformer' });
    expect(result.metadata.annotations).toEqual({
      'example.com/from': 'enricher',
    });
    // entityEnricher rules run first, so entityTransformer wins on conflicts
    expect((result.spec as any).lifecycle).toBe('from-transformer');
  });
});
