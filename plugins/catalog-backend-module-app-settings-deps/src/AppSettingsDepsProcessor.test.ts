import { AppSettingsDepsProcessor } from './AppSettingsDepsProcessor';
import { ConfigReader } from '@backstage/config';
import { CatalogProcessorEmit } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';
import { LocationSpec } from '@backstage/plugin-catalog-common';
import { UrlReaderService } from '@backstage/backend-plugin-api';
import { mockServices } from '@backstage/backend-test-utils';

function createMockUrlReader(content: Record<string, unknown>): UrlReaderService {
  return {
    readUrl: jest.fn().mockResolvedValue({
      buffer: () => Promise.resolve(Buffer.from(JSON.stringify(content))),
    }),
    readTree: jest.fn(),
    search: jest.fn(),
  } as unknown as UrlReaderService;
}

describe('AppSettingsDepsProcessor', () => {
  const config = new ConfigReader({
    integrations: {
      github: [{ host: 'github.com' }],
    },
  });
  const logger = mockServices.logger.mock();

  const location: LocationSpec = {
    type: 'url',
    target: 'https://github.com/org/repo/blob/main/catalog-info.yaml',
  };

  it('returns the processor name', () => {
    const urlReader = createMockUrlReader({});
    const processor = new AppSettingsDepsProcessor(urlReader, config, logger);
    expect(processor.getProcessorName()).toBe('AppSettingsDepsProcessor');
  });

  it('skips entities without the annotation', async () => {
    const urlReader = createMockUrlReader({});
    const processor = new AppSettingsDepsProcessor(urlReader, config, logger);
    const emit: CatalogProcessorEmit = jest.fn();

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'my-service' },
    };

    const result = await processor.preProcessEntity(entity, location, emit);

    expect(result).toBe(entity);
    expect(emit).not.toHaveBeenCalled();
    expect(urlReader.readUrl).not.toHaveBeenCalled();
  });

  it('emits dependsOn relations for each top-level key', async () => {
    const settingsContent = {
      Album: {
        Api: { BaseUrl: 'https://localhost', ApiKey: '1234' },
      },
      User: {
        Api: { BaseUrl: 'https://localhost', ApiKey: '1234' },
      },
    };

    const urlReader = createMockUrlReader(settingsContent);
    const processor = new AppSettingsDepsProcessor(urlReader, config, logger);
    const emit: CatalogProcessorEmit = jest.fn();

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'internal.com/app-settings': './appsettings.json',
        },
      },
    };

    await processor.preProcessEntity(entity, location, emit);

    expect(emit).toHaveBeenCalledTimes(2);
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'relation',
        relation: expect.objectContaining({
          type: 'dependsOn',
          source: { kind: 'Component', namespace: 'default', name: 'my-service' },
          target: { kind: 'Component', namespace: 'default', name: 'album' },
        }),
      }),
    );
    expect(emit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'relation',
        relation: expect.objectContaining({
          type: 'dependsOn',
          source: { kind: 'Component', namespace: 'default', name: 'my-service' },
          target: { kind: 'Component', namespace: 'default', name: 'user' },
        }),
      }),
    );
  });

  it('handles file read errors gracefully', async () => {
    const urlReader: UrlReaderService = {
      readUrl: jest.fn().mockRejectedValue(new Error('Not found')),
      readTree: jest.fn(),
      search: jest.fn(),
    } as unknown as UrlReaderService;

    const processor = new AppSettingsDepsProcessor(urlReader, config, logger);
    const emit: CatalogProcessorEmit = jest.fn();

    const entity: Entity = {
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: 'my-service',
        annotations: {
          'internal.com/app-settings': './appsettings.json',
        },
      },
    };

    const result = await processor.preProcessEntity(entity, location, emit);

    expect(result).toBe(entity);
    expect(emit).not.toHaveBeenCalled();
  });
});
