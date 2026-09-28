import { Entity } from '@backstage/catalog-model';
import { EntityEnricherProcessor, EnricherRule, parseFilterString } from './EntityEnricherProcessor';

function createEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'my-service',
    },
    spec: {
      type: 'service',
      lifecycle: 'experimental',
      owner: 'user:default/jdoe',
    },
    ...overrides,
  };
}

describe('parseFilterString', () => {
  it('parses a single key:value condition', () => {
    expect(parseFilterString('kind:User')).toEqual({ kind: 'User' });
  });

  it('parses multiple AND-combined conditions', () => {
    expect(parseFilterString('kind:User spec.type:employee')).toEqual({
      kind: 'User',
      'spec.type': 'employee',
    });
  });

  it('parses $exists as an existence check', () => {
    expect(
      parseFilterString(
        'metadata.annotations.github.com/user-login:$exists',
      ),
    ).toEqual({
      'metadata.annotations.github.com/user-login': { $exists: true },
    });
  });

  it('parses mixed value and $exists conditions', () => {
    expect(
      parseFilterString(
        'kind:User metadata.annotations.github.com/user-login:$exists',
      ),
    ).toEqual({
      kind: 'User',
      'metadata.annotations.github.com/user-login': { $exists: true },
    });
  });

  it('throws on invalid token without colon', () => {
    expect(() => parseFilterString('invalid')).toThrow(
      'expected "key:value" format',
    );
  });
});

describe('EntityEnricherProcessor', () => {
  it('returns the correct processor name', () => {
    const processor = new EntityEnricherProcessor([]);
    expect(processor.getProcessorName()).toBe('EntityEnricherProcessor');
  });

  it('sets an annotation from a JSONata expression', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/owner-name',
        value: "$substringAfter(spec.owner, 'user:default/')",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'example.com/owner-name': 'jdoe',
    });
  });

  it('sets a label from a JSONata expression', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.labels',
        key: 'team',
        value: "$substringAfter(spec.owner, 'user:default/')",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.labels).toEqual({ team: 'jdoe' });
  });

  it('sets a direct spec field', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'spec.lifecycle',
        value: "'production'",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const entity = createEntity({
      spec: {
        type: 'service',
        owner: 'user:default/jdoe',
      },
    });
    const result = await processor.preProcessEntity(entity);

    expect((result.spec as any).lifecycle).toBe('production');
  });

  it('overwrites an existing annotation', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/existing',
        value: "'new-value'",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const entity = createEntity({
      metadata: {
        name: 'my-service',
        annotations: { 'example.com/existing': 'original-value' },
      },
    });
    const result = await processor.preProcessEntity(entity);

    expect(result.metadata.annotations!['example.com/existing']).toBe(
      'new-value',
    );
  });

  it('overwrites an existing direct field', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'spec.lifecycle',
        value: "'production'",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect((result.spec as any).lifecycle).toBe('production');
  });

  it('skips a rule when the expression evaluates to undefined', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/missing',
        value: 'spec.nonExistentField',
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toBeUndefined();
  });

  it('filters by entity kind', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/user-only',
        value: "'yes'",
        filter: { kind: 'User' },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toBeUndefined();
  });

  it('matches filter values case-insensitively', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/matched',
        value: "'yes'",
        filter: { kind: 'component' },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'example.com/matched': 'yes',
    });
  });

  it('filters with $exists to check field presence', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/has-owner',
        value: "'yes'",
        filter: { 'spec.owner': { $exists: true } },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const withOwner = await processor.preProcessEntity(createEntity());
    expect(withOwner.metadata.annotations).toEqual({
      'example.com/has-owner': 'yes',
    });

    const withoutOwner = await processor.preProcessEntity(
      createEntity({ spec: { type: 'service' } }),
    );
    expect(withoutOwner.metadata.annotations).toBeUndefined();
  });

  it('skips when a required annotation is missing', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'microsoft.com/email',
        value: "'computed'",
        filter: {
          kind: 'User',
          'metadata.annotations.github.com/user-login': { $exists: true },
        },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const withoutAnnotation: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: { name: 'test' },
      spec: {},
    };
    const result = await processor.preProcessEntity(withoutAnnotation);

    expect(
      result.metadata.annotations?.['microsoft.com/email'],
    ).toBeUndefined();
  });

  it('combines multiple filter conditions with AND', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/matched',
        value: "'yes'",
        filter: {
          kind: 'Component',
          'spec.type': 'service',
        },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const service = await processor.preProcessEntity(createEntity());
    expect(service.metadata.annotations).toEqual({
      'example.com/matched': 'yes',
    });

    const website = await processor.preProcessEntity(
      createEntity({ spec: { type: 'website', owner: 'x' } }),
    );
    expect(website.metadata.annotations).toBeUndefined();
  });

  it('supports $in for multiple allowed values', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/matched',
        value: "'yes'",
        filter: {
          'spec.type': { $in: ['service', 'website'] },
        },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const service = await processor.preProcessEntity(createEntity());
    expect(service.metadata.annotations).toEqual({
      'example.com/matched': 'yes',
    });

    const library = await processor.preProcessEntity(
      createEntity({ spec: { type: 'library', owner: 'x' } }),
    );
    expect(library.metadata.annotations).toBeUndefined();
  });

  it('supports $not filter', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/not-user',
        value: "'yes'",
        filter: { $not: { kind: 'User' } },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const component = await processor.preProcessEntity(createEntity());
    expect(component.metadata.annotations).toEqual({
      'example.com/not-user': 'yes',
    });

    const user = await processor.preProcessEntity(
      createEntity({ kind: 'User' }),
    );
    expect(user.metadata.annotations).toBeUndefined();
  });

  it('applies multiple rules in order', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/first',
        value: "'one'",
      },
      {
        path: 'metadata.annotations',
        key: 'example.com/second',
        value: "'two'",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'example.com/first': 'one',
      'example.com/second': 'two',
    });
  });

  it('supports string concatenation in JSONata', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'microsoft.com/email',
        value: "$substringAfter(spec.owner, 'user:default/') & '@spotify.com'",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'microsoft.com/email': 'jdoe@spotify.com',
    });
  });

  it('preserves existing annotations when adding new ones', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/new',
        value: "'new-value'",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const entity = createEntity({
      metadata: {
        name: 'my-service',
        annotations: { 'example.com/existing': 'keep-me' },
      },
    });
    const result = await processor.preProcessEntity(entity);

    expect(result.metadata.annotations).toEqual({
      'example.com/existing': 'keep-me',
      'example.com/new': 'new-value',
    });
  });

  it('passes through entities unchanged when no rules are configured', async () => {
    const processor = new EntityEnricherProcessor([]);
    const entity = createEntity();
    const result = await processor.preProcessEntity(entity);

    expect(result).toBe(entity);
  });

  it('transforms github login to email with filter', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'microsoft.com/email',
        value:
          "$replace($trim($replace(metadata.annotations.`github.com/user-login`, /am$/, '')), '-', '.') & '@example.com'",
        filter: {
          kind: 'User',
          'metadata.annotations.github.com/user-login': { $exists: true },
        },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'john-doeam',
        annotations: { 'github.com/user-login': 'john-doeam' },
      },
      spec: {},
    };
    const result = await processor.preProcessEntity(entity);

    expect(result.metadata.annotations!['microsoft.com/email']).toBe(
      'john.doe@example.com',
    );
  });

  it('skips transform when github login annotation is missing', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'microsoft.com/email',
        value:
          "$replace($trim($replace(metadata.annotations.`github.com/user-login`, /am$/, '')), '-', '.') & '@example.com'",
        filter: {
          kind: 'User',
          'metadata.annotations.github.com/user-login': { $exists: true },
        },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: { name: 'no-github' },
      spec: {},
    };
    const result = await processor.preProcessEntity(entity);

    expect(
      result.metadata.annotations?.['microsoft.com/email'],
    ).toBeUndefined();
  });

  it('skips transform for non-User entities', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'microsoft.com/email',
        value:
          "$replace($trim($replace(metadata.annotations.`github.com/user-login`, /am$/, '')), '-', '.') & '@example.com'",
        filter: {
          kind: 'User',
          'metadata.annotations.github.com/user-login': { $exists: true },
        },
      },
    ];
    const processor = new EntityEnricherProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(
      result.metadata.annotations?.['microsoft.com/email'],
    ).toBeUndefined();
  });

  it('supports string filter with kind match', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/matched',
        value: "'yes'",
        filter: parseFilterString('kind:User'),
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const user: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: { name: 'jdoe' },
      spec: {},
    };

    const userResult = await processor.preProcessEntity(user);
    const componentResult = await processor.preProcessEntity(createEntity());

    expect(userResult.metadata.annotations!['example.com/matched']).toBe('yes');
    expect(componentResult.metadata.annotations).toBeUndefined();
  });

  it('supports string filter with $exists check', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/has-login',
        value: "'yes'",
        filter: parseFilterString(
          'kind:User metadata.annotations.github.com/user-login:$exists',
        ),
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const withLogin: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'jdoe',
        annotations: { 'github.com/user-login': 'jdoe' },
      },
      spec: {},
    };
    const withoutLogin: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: { name: 'jdoe' },
      spec: {},
    };

    const withResult = await processor.preProcessEntity(withLogin);
    const withoutResult = await processor.preProcessEntity(withoutLogin);
    const componentResult = await processor.preProcessEntity(createEntity());

    expect(withResult.metadata.annotations!['example.com/has-login']).toBe(
      'yes',
    );
    expect(
      withoutResult.metadata.annotations?.['example.com/has-login'],
    ).toBeUndefined();
    expect(
      componentResult.metadata.annotations?.['example.com/has-login'],
    ).toBeUndefined();
  });

  it('README example: extracts owner-name annotation from spec.owner', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/owner-name',
        filter: parseFilterString('kind:Component spec.owner:$exists'),
        value: '$substringAfter(spec.owner, "group:default/")',
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const input: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
      },
      spec: {
        owner: 'group:default/platform',
      },
    };

    const result = await processor.preProcessEntity(input);

    expect(result).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'example.com/owner-name': 'platform',
        },
      },
      spec: {
        owner: 'group:default/platform',
      },
    });
  });

  it('README example: skips entities without spec.owner', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/owner-name',
        filter: parseFilterString('kind:Component spec.owner:$exists'),
        value: '$substringAfter(spec.owner, "group:default/")',
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const input: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'no-owner' },
      spec: {},
    };

    const result = await processor.preProcessEntity(input);

    expect(result.metadata.annotations).toBeUndefined();
  });

  it('README example: derives microsoft email from github login', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'microsoft.com/email',
        filter: parseFilterString(
          'kind:User metadata.annotations.github.com/user-login:$exists',
        ),
        value:
          '$replace($trim($replace(metadata.annotations.`github.com/user-login`, /am$/, "")), "-", ".") & "@example.com"',
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const input: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'john-doeam',
        annotations: { 'github.com/user-login': 'john-doeam' },
      },
      spec: {},
    };

    const result = await processor.preProcessEntity(input);

    expect(result).toEqual({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'User',
      metadata: {
        name: 'john-doeam',
        annotations: {
          'github.com/user-login': 'john-doeam',
          'microsoft.com/email': 'john.doe@example.com',
        },
      },
      spec: {},
    });
  });

  it('applies rule when no filter is specified', async () => {
    const rules: EnricherRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/all',
        value: "'applied'",
      },
    ];
    const processor = new EntityEnricherProcessor(rules);

    const component = await processor.preProcessEntity(createEntity());
    const user = await processor.preProcessEntity(
      createEntity({ kind: 'User' }),
    );

    expect(component.metadata.annotations!['example.com/all']).toBe('applied');
    expect(user.metadata.annotations!['example.com/all']).toBe('applied');
  });
});
