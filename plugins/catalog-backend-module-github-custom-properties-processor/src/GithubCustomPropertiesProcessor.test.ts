import { Entity, ANNOTATION_LOCATION } from '@backstage/catalog-model';
import { ScmIntegrations } from '@backstage/integration';
import { ConfigReader } from '@backstage/config';
import { mockServices } from '@backstage/backend-test-utils';
import {
  GithubCustomPropertiesProcessor,
  PropertyMapping,
} from './GithubCustomPropertiesProcessor';

const mockRequest = jest.fn();
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    request: mockRequest,
  })),
}));

const DEFAULT_MAPPINGS: PropertyMapping[] = [
  { property: 'teams', entityPath: 'spec.owner', prefix: 'group:default/' },
  { property: 'type', entityPath: 'spec.type' },
  { property: 'product_relevance', entityPath: 'spec.lifecycle' },
];

function createProcessor(mappings: PropertyMapping[] = DEFAULT_MAPPINGS) {
  const config = new ConfigReader({
    integrations: {
      github: [{ host: 'github.com', token: 'test-token' }],
    },
  });
  const integrations = ScmIntegrations.fromConfig(config);
  const logger = mockServices.logger.mock();
  return new GithubCustomPropertiesProcessor(integrations, logger, mappings);
}

function createEntity(overrides: Partial<Entity> = {}): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind: 'Component',
    metadata: {
      name: 'my-service',
      annotations: {
        [ANNOTATION_LOCATION]:
          'url:https://github.com/my-org/my-repo/blob/main/catalog-info.yaml',
      },
    },
    spec: {
      type: 'service',
      lifecycle: 'production',
      owner: 'team-a',
    },
    ...overrides,
  };
}

describe('GithubCustomPropertiesProcessor', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('returns the correct processor name', () => {
    const processor = createProcessor();
    expect(processor.getProcessorName()).toBe(
      'GithubCustomPropertiesProcessor',
    );
  });

  it('augments entity with all configured mappings', async () => {
    mockRequest.mockResolvedValue({
      data: [
        { property_name: 'teams', value: 'platform-team' },
        { property_name: 'type', value: 'library' },
        { property_name: 'product_relevance', value: 'experimental' },
      ],
    });

    const processor = createProcessor();
    const result = await processor.preProcessEntity(createEntity());

    expect(result.spec).toEqual(
      expect.objectContaining({
        owner: 'group:default/platform-team',
        type: 'library',
        lifecycle: 'experimental',
      }),
    );
  });

  it('only sets properties that are present in the response', async () => {
    mockRequest.mockResolvedValue({
      data: [{ property_name: 'teams', value: 'backend-team' }],
    });

    const processor = createProcessor();
    const result = await processor.preProcessEntity(createEntity());

    expect(result.spec).toEqual(
      expect.objectContaining({
        owner: 'group:default/backend-team',
        type: 'service',
        lifecycle: 'production',
      }),
    );
  });

  it('skips properties with null values', async () => {
    mockRequest.mockResolvedValue({
      data: [
        { property_name: 'teams', value: null },
        { property_name: 'type', value: 'website' },
      ],
    });

    const processor = createProcessor();
    const result = await processor.preProcessEntity(createEntity());

    expect(result.spec).toEqual(
      expect.objectContaining({
        owner: 'team-a',
        type: 'website',
      }),
    );
  });

  it('applies prefix to value when configured', async () => {
    mockRequest.mockResolvedValue({
      data: [{ property_name: 'teams', value: 'my-team' }],
    });

    const processor = createProcessor([
      { property: 'teams', entityPath: 'spec.owner', prefix: 'group:default/' },
    ]);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.spec).toEqual(
      expect.objectContaining({ owner: 'group:default/my-team' }),
    );
  });

  it('does not apply prefix when not configured', async () => {
    mockRequest.mockResolvedValue({
      data: [{ property_name: 'category', value: 'internal' }],
    });

    const processor = createProcessor([
      { property: 'category', entityPath: 'spec.type' },
    ]);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.spec).toEqual(expect.objectContaining({ type: 'internal' }));
  });

  it('supports custom mappings to arbitrary spec fields', async () => {
    mockRequest.mockResolvedValue({
      data: [{ property_name: 'business_unit', value: 'payments' }],
    });

    const processor = createProcessor([
      { property: 'business_unit', entityPath: 'spec.system' },
    ]);
    const result = await processor.preProcessEntity(createEntity());

    expect(result.spec).toEqual(
      expect.objectContaining({ system: 'payments' }),
    );
  });

  it('returns entity unchanged when no mappings are configured', async () => {
    mockRequest.mockResolvedValue({
      data: [{ property_name: 'teams', value: 'some-team' }],
    });

    const processor = createProcessor([]);
    const entity = createEntity();
    const result = await processor.preProcessEntity(entity);

    expect(result.spec).toEqual(entity.spec);
  });

  it('skips non-Component entities', async () => {
    const processor = createProcessor();
    const entity = createEntity({ kind: 'API' });

    const result = await processor.preProcessEntity(entity);

    expect(mockRequest).not.toHaveBeenCalled();
    expect(result).toBe(entity);
  });

  it('skips entities without a location annotation', async () => {
    const processor = createProcessor();
    const entity = createEntity();
    delete entity.metadata.annotations;

    const result = await processor.preProcessEntity(entity);

    expect(mockRequest).not.toHaveBeenCalled();
    expect(result).toBe(entity);
  });

  it('skips entities with a non-GitHub location', async () => {
    const processor = createProcessor();
    const entity = createEntity();
    entity.metadata.annotations![ANNOTATION_LOCATION] =
      'url:https://gitlab.com/my-org/my-repo/blob/main/catalog-info.yaml';

    const result = await processor.preProcessEntity(entity);

    expect(mockRequest).not.toHaveBeenCalled();
    expect(result).toBe(entity);
  });

  it('returns the entity unchanged and logs a warning on API failure', async () => {
    mockRequest.mockRejectedValue(new Error('HttpError: Not Found'));

    const processor = createProcessor();
    const entity = createEntity();
    const result = await processor.preProcessEntity(entity);

    expect(result).toEqual(entity);
  });

  it('calls Octokit with the correct owner and repo', async () => {
    mockRequest.mockResolvedValue({ data: [] });

    const processor = createProcessor();
    await processor.preProcessEntity(createEntity());

    expect(mockRequest).toHaveBeenCalledWith(
      'GET /repos/{owner}/{repo}/properties/values',
      { owner: 'my-org', repo: 'my-repo' },
    );
  });
});
