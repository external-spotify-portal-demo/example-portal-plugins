import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { AllowedEntityOriginProcessor } from './AllowedEntityOriginProcessor';

const emit = jest.fn();
const allowedOrigin: LocationSpec = {
  type: 'url',
  target: 'https://github.com/myorg/mcp-servers/blob/main/catalog-info.yaml',
};

const disallowedOrigin: LocationSpec = {
  type: 'url',
  target: 'https://github.com/myorg/random-repo/blob/main/catalog-info.yaml',
};

const location: LocationSpec = {
  type: 'url',
  target: 'https://github.com/myorg/mcp-servers/blob/main/catalog-info.yaml',
};

function makeEntity(kind: string, type?: string): Entity {
  return {
    apiVersion: 'backstage.io/v1alpha1',
    kind,
    metadata: { name: 'test-entity' },
    ...(type ? { spec: { type } } : {}),
  };
}

describe('AllowedEntityOriginProcessor', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the correct processor name', () => {
    const processor = new AllowedEntityOriginProcessor([]);
    expect(processor.getProcessorName()).toBe('AllowedEntityOriginProcessor');
  });

  it('passes through entities that do not match any rule', async () => {
    const processor = new AllowedEntityOriginProcessor([
      {
        kind: 'McpServer',
        allowedLocationPatterns: ['https://github.com/myorg/mcp-servers/'],
      },
    ]);

    const entity = makeEntity('Component', 'service');
    const result = await processor.preProcessEntity(
      entity,
      location,
      emit,
      disallowedOrigin,
    );

    expect(result).toBe(entity);
  });

  it('passes through entities matching kind from an allowed origin', async () => {
    const processor = new AllowedEntityOriginProcessor([
      {
        kind: 'McpServer',
        allowedLocationPatterns: ['https://github.com/myorg/mcp-servers/'],
      },
    ]);

    const entity = makeEntity('McpServer');
    const result = await processor.preProcessEntity(
      entity,
      location,
      emit,
      allowedOrigin,
    );

    expect(result).toBe(entity);
  });

  it('rejects entities matching kind from a disallowed origin', async () => {
    const processor = new AllowedEntityOriginProcessor([
      {
        kind: 'McpServer',
        allowedLocationPatterns: ['https://github.com/myorg/mcp-servers/'],
      },
    ]);

    const entity = makeEntity('McpServer');
    await expect(
      processor.preProcessEntity(entity, location, emit, disallowedOrigin),
    ).rejects.toThrow(
      /Entity "test-entity" of kind "McpServer" is not allowed from origin/,
    );
  });

  it('matches kind case-insensitively', async () => {
    const processor = new AllowedEntityOriginProcessor([
      {
        kind: 'mcpserver',
        allowedLocationPatterns: ['https://github.com/myorg/mcp-servers/'],
      },
    ]);

    const entity = makeEntity('McpServer');
    await expect(
      processor.preProcessEntity(entity, location, emit, disallowedOrigin),
    ).rejects.toThrow(/not allowed from origin/);
  });

  it('filters by type when specified in the rule', async () => {
    const processor = new AllowedEntityOriginProcessor([
      {
        kind: 'Component',
        type: 'mcp-server',
        allowedLocationPatterns: ['https://github.com/myorg/mcp-servers/'],
      },
    ]);

    const serviceEntity = makeEntity('Component', 'service');
    const result = await processor.preProcessEntity(
      serviceEntity,
      location,
      emit,
      disallowedOrigin,
    );
    expect(result).toBe(serviceEntity);

    const mcpEntity = makeEntity('Component', 'mcp-server');
    await expect(
      processor.preProcessEntity(mcpEntity, location, emit, disallowedOrigin),
    ).rejects.toThrow(/not allowed from origin/);
  });

  it('allows when origin matches any of multiple patterns', async () => {
    const processor = new AllowedEntityOriginProcessor([
      {
        kind: 'McpServer',
        allowedLocationPatterns: [
          'https://github.com/myorg/mcp-servers/',
          'https://github.com/myorg/internal-tools/',
        ],
      },
    ]);

    const entity = makeEntity('McpServer');
    const altOrigin: LocationSpec = {
      type: 'url',
      target:
        'https://github.com/myorg/internal-tools/blob/main/catalog-info.yaml',
    };

    const result = await processor.preProcessEntity(
      entity,
      location,
      emit,
      altOrigin,
    );

    expect(result).toBe(entity);
  });

  it('applies multiple rules independently', async () => {
    const processor = new AllowedEntityOriginProcessor([
      {
        kind: 'McpServer',
        allowedLocationPatterns: ['https://github.com/myorg/mcp-servers/'],
      },
      {
        kind: 'API',
        type: 'grpc',
        allowedLocationPatterns: ['https://github.com/myorg/grpc-apis/'],
      },
    ]);

    await expect(
      processor.preProcessEntity(
        makeEntity('McpServer'),
        location,
        emit,
        disallowedOrigin,
      ),
    ).rejects.toThrow(/not allowed from origin/);

    await expect(
      processor.preProcessEntity(
        makeEntity('API', 'grpc'),
        location,
        emit,
        disallowedOrigin,
      ),
    ).rejects.toThrow(/not allowed from origin/);

    const openapiEntity = makeEntity('API', 'openapi');
    const result = await processor.preProcessEntity(
      openapiEntity,
      location,
      emit,
      disallowedOrigin,
    );
    expect(result).toBe(openapiEntity);
  });

  it('passes through when no rules are configured', async () => {
    const processor = new AllowedEntityOriginProcessor([]);

    const entity = makeEntity('McpServer');
    const result = await processor.preProcessEntity(
      entity,
      location,
      emit,
      disallowedOrigin,
    );

    expect(result).toBe(entity);
  });
});
