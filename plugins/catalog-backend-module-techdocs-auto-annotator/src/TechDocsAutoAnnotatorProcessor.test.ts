import { Entity } from '@backstage/catalog-model';
import { TechDocsAutoAnnotatorProcessor } from './TechDocsAutoAnnotatorProcessor';

function createEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'my-service',
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'team-a',
    },
    ...overrides,
  };
}

describe('TechDocsAutoAnnotatorProcessor', () => {
  it('returns the correct processor name', () => {
    const processor = new TechDocsAutoAnnotatorProcessor(['Component']);
    expect(processor.getProcessorName()).toBe(
      'TechDocsAutoAnnotatorProcessor',
    );
  });

  it('adds techdocs annotation to a matching entity', async () => {
    const processor = new TechDocsAutoAnnotatorProcessor(['Component']);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'backstage.io/techdocs-ref': 'dir:.',
    });
  });

  it('does not overwrite an existing techdocs annotation', async () => {
    const processor = new TechDocsAutoAnnotatorProcessor(['Component']);
    const entity = createEntity({
      metadata: {
        name: 'my-service',
        annotations: {
          'backstage.io/techdocs-ref': 'url:https://github.com/org/repo',
        },
      },
    });

    const result = await processor.preProcessEntity(entity);

    expect(result.metadata.annotations!['backstage.io/techdocs-ref']).toBe(
      'url:https://github.com/org/repo',
    );
    expect(result).toBe(entity);
  });

  it('skips entities whose kind is not in the configured list', async () => {
    const processor = new TechDocsAutoAnnotatorProcessor(['Component']);
    const entity = createEntity({ kind: 'User' });

    const result = await processor.preProcessEntity(entity);

    expect(result).toBe(entity);
    expect(result.metadata.annotations).toBeUndefined();
  });

  it('matches kinds case-insensitively', async () => {
    const processor = new TechDocsAutoAnnotatorProcessor(['component']);
    const result = await processor.preProcessEntity(
      createEntity({ kind: 'Component' }),
    );

    expect(result.metadata.annotations).toEqual({
      'backstage.io/techdocs-ref': 'dir:.',
    });
  });

  it('handles multiple configured kinds', async () => {
    const processor = new TechDocsAutoAnnotatorProcessor([
      'Component',
      'API',
      'System',
    ]);

    const component = await processor.preProcessEntity(createEntity());
    const api = await processor.preProcessEntity(
      createEntity({ kind: 'API' }),
    );
    const system = await processor.preProcessEntity(
      createEntity({ kind: 'System' }),
    );
    const user = await processor.preProcessEntity(
      createEntity({ kind: 'User' }),
    );

    expect(component.metadata.annotations?.['backstage.io/techdocs-ref']).toBe(
      'dir:.',
    );
    expect(api.metadata.annotations?.['backstage.io/techdocs-ref']).toBe(
      'dir:.',
    );
    expect(system.metadata.annotations?.['backstage.io/techdocs-ref']).toBe(
      'dir:.',
    );
    expect(user).toBe(user);
    expect(user.metadata.annotations).toBeUndefined();
  });

  it('preserves existing annotations when adding techdocs', async () => {
    const processor = new TechDocsAutoAnnotatorProcessor(['Component']);
    const entity = createEntity({
      metadata: {
        name: 'my-service',
        annotations: {
          'example.com/custom': 'value',
        },
      },
    });

    const result = await processor.preProcessEntity(entity);

    expect(result.metadata.annotations).toEqual({
      'example.com/custom': 'value',
      'backstage.io/techdocs-ref': 'dir:.',
    });
  });
});
