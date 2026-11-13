import { Entity } from '@backstage/catalog-model';
import { mockServices } from '@backstage/backend-test-utils';
import {
  EntityTransformerProcessor,
  TransformerRule,
  parseFilterString,
} from './EntityTransformerProcessor';

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
      parseFilterString('metadata.annotations.github.com/user-login:$exists'),
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

  it('parses comma-separated values as $in', () => {
    expect(parseFilterString('kind:Component,API')).toEqual({
      kind: { $in: ['Component', 'API'] },
    });
  });

  it('throws on invalid token without colon', () => {
    expect(() => parseFilterString('invalid')).toThrow(
      'expected "key:value" format',
    );
  });
});

describe('EntityTransformerProcessor', () => {
  it('returns the correct processor name', () => {
    const processor = new EntityTransformerProcessor([]);
    expect(processor.getProcessorName()).toBe('EntityTransformerProcessor');
  });

  it('sets an annotation from a JSONata expression', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/owner-name',
        value: "$substringAfter(spec.owner, 'user:default/')",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'example.com/owner-name': 'jdoe',
    });
  });

  it('sets a label from a JSONata expression', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.labels',
        key: 'team',
        value: "$substringAfter(spec.owner, 'user:default/')",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.labels).toEqual({ team: 'jdoe' });
  });

  it('sets a direct spec field', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'spec.lifecycle',
        value: "'production'",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
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
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/existing',
        value: "'new-value'",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
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
    const rules: TransformerRule[] = [
      {
        path: 'spec.lifecycle',
        value: "'production'",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect((result.spec as any).lifecycle).toBe('production');
  });

  it('skips a rule when the expression evaluates to undefined', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/missing',
        value: 'spec.nonExistentField',
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toBeUndefined();
  });

  it('filters by entity kind', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/user-only',
        value: "'yes'",
        filter: { kind: 'User' },
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toBeUndefined();
  });

  it('matches filter values case-insensitively', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/matched',
        value: "'yes'",
        filter: { kind: 'component' },
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'example.com/matched': 'yes',
    });
  });

  it('filters with $exists to check field presence', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/has-owner',
        value: "'yes'",
        filter: { 'spec.owner': { $exists: true } },
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
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
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
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
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/matched',
        value: "'yes'",
        filter: {
          'spec.type': { $in: ['service', 'website'] },
        },
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/not-user',
        value: "'yes'",
        filter: { $not: { kind: 'User' } },
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
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
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'example.com/first': 'one',
      'example.com/second': 'two',
    });
  });

  it('supports string concatenation in JSONata', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'microsoft.com/email',
        value: "$substringAfter(spec.owner, 'user:default/') & '@spotify.com'",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.metadata.annotations).toEqual({
      'microsoft.com/email': 'jdoe@spotify.com',
    });
  });

  it('preserves existing annotations when adding new ones', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/new',
        value: "'new-value'",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
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
    const processor = new EntityTransformerProcessor([]);
    const entity = createEntity();
    const result = await processor.preProcessEntity(entity);

    expect(result).toBe(entity);
  });

  it('transforms github login to email with filter', async () => {
    const rules: TransformerRule[] = [
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
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
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
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
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
    const processor = new EntityTransformerProcessor(rules);
    const result = await processor.preProcessEntity(createEntity());

    expect(
      result.metadata.annotations?.['microsoft.com/email'],
    ).toBeUndefined();
  });

  it('supports string filter with kind match', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/matched',
        value: "'yes'",
        filter: parseFilterString('kind:User'),
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/has-login',
        value: "'yes'",
        filter: parseFilterString(
          'kind:User metadata.annotations.github.com/user-login:$exists',
        ),
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/owner-name',
        filter: parseFilterString('kind:Component spec.owner:$exists'),
        value: '$substringAfter(spec.owner, "group:default/")',
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/owner-name',
        filter: parseFilterString('kind:Component spec.owner:$exists'),
        value: '$substringAfter(spec.owner, "group:default/")',
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
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
    const processor = new EntityTransformerProcessor(rules);

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
    const rules: TransformerRule[] = [
      {
        path: 'metadata.annotations',
        key: 'example.com/all',
        value: "'applied'",
      },
    ];
    const processor = new EntityTransformerProcessor(rules);

    const component = await processor.preProcessEntity(createEntity());
    const user = await processor.preProcessEntity(
      createEntity({ kind: 'User' }),
    );

    expect(component.metadata.annotations!['example.com/all']).toBe('applied');
    expect(user.metadata.annotations!['example.com/all']).toBe('applied');
  });

  it('strips the group owner namespace for kinds matched by a comma-separated string filter', async () => {
    const rules: TransformerRule[] = [
      {
        path: 'spec.owner',
        filter: 'kind:component,domain,system,template spec.owner:$exists',
        value:
          '($o := spec.owner; $kind := $contains($o, ":") ? $substringBefore($o, ":") : "group"; ($kind = "group" and $contains($o, "/")) ? ($contains($o, ":") ? "group:" : "") & $substringAfter($o, "/"))',
      },
    ];
    const processor = new EntityTransformerProcessor(rules);
    const ownerOf = async (kind: string, owner?: string) => {
      const result = await processor.preProcessEntity(
        createEntity({ kind, spec: owner ? { owner } : {} }),
      );
      return (result.spec as any).owner;
    };

    expect(await ownerOf('Component', 'group:custom/a')).toBe('group:a');
    expect(await ownerOf('Domain', 'group:custom/a')).toBe('group:a');
    expect(await ownerOf('System', 'custom/a')).toBe('a');
    expect(await ownerOf('Template', 'group:custom/a')).toBe('group:a');
    expect(await ownerOf('Template')).toBeUndefined();
    expect(await ownerOf('API', 'group:custom/a')).toBe('group:custom/a');
    expect(await ownerOf('Component', 'group:a')).toBe('group:a');
    expect(await ownerOf('Component', 'user:custom/bob')).toBe(
      'user:custom/bob',
    );
  });

  it('skips a rule and logs a warning when the expression fails to evaluate', async () => {
    const logger = mockServices.logger.mock();
    const rules: TransformerRule[] = [
      {
        path: 'spec.owner',
        value: '$contains(spec.owner, ":") ? "x"',
      },
      {
        path: 'spec.lifecycle',
        value: "'production'",
      },
    ];
    const processor = new EntityTransformerProcessor(rules, { logger });

    const result = await processor.preProcessEntity(
      createEntity({ spec: { owner: 123 } }),
    );

    expect((result.spec as any).owner).toBe(123);
    expect((result.spec as any).lifecycle).toBe('production');
    expect(logger.warn).toHaveBeenCalledWith(
      'Skipping rule "spec.owner" on component:default/my-service: failed to evaluate JSONata expression: T0410: Argument 1 of function "contains" does not match function signature',
    );
  });

  it('reports an invalid string filter as a filter error, not a JSONata error', () => {
    expect(
      () =>
        new EntityTransformerProcessor([
          { path: 'spec.owner', value: "'x'", filter: '($o := spec.owner' },
        ]),
    ).toThrow(
      'Failed to parse filter for "spec.owner": Invalid filter token "($o": expected "key:value" format',
    );
  });
});
