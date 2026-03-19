import { PlaygroundEntityProcessor } from './PlaygroundEntityProcessor';
import {
  Entity,
  RELATION_OWNED_BY,
  RELATION_OWNER_OF,
} from '@backstage/catalog-model';
import { CatalogProcessorEmit } from '@backstage/plugin-catalog-node';
import { LocationSpec } from '@backstage/plugin-catalog-common';

describe('PlaygroundEntityProcessor', () => {
  const processor = new PlaygroundEntityProcessor();

  describe('getProcessorName', () => {
    it('returns the processor name', () => {
      expect(processor.getProcessorName()).toBe('PlaygroundEntityProcessor');
    });
  });

  describe('validateEntityKind', () => {
    it('returns false for non-Playground entities', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test' },
        spec: { type: 'service', lifecycle: 'production', owner: 'group:default/team-a' },
      };
      await expect(processor.validateEntityKind(entity)).resolves.toBe(false);
    });

    it('returns true for valid Playground entities', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Playground',
        metadata: { name: 'my-sandbox' },
        spec: { type: 'sandbox', lifecycle: 'active', owner: 'user:default/jane' },
      };
      await expect(processor.validateEntityKind(entity)).resolves.toBe(true);
    });

    it('throws for invalid spec.type', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Playground',
        metadata: { name: 'my-sandbox' },
        spec: { type: 'invalid', lifecycle: 'active', owner: 'user:default/jane' },
      };
      await expect(processor.validateEntityKind(entity)).rejects.toThrow();
    });

    it('throws for invalid spec.lifecycle', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Playground',
        metadata: { name: 'my-sandbox' },
        spec: { type: 'sandbox', lifecycle: 'invalid', owner: 'user:default/jane' },
      };
      await expect(processor.validateEntityKind(entity)).rejects.toThrow();
    });

    it('throws for missing spec.owner', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Playground',
        metadata: { name: 'my-sandbox' },
        spec: { type: 'sandbox', lifecycle: 'active' },
      };
      await expect(processor.validateEntityKind(entity)).rejects.toThrow();
    });
  });

  describe('postProcessEntity', () => {
    const location: LocationSpec = { type: 'url', target: 'https://example.com' };

    it('emits ownedBy and ownerOf relationships for Playground entities', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Playground',
        metadata: { name: 'my-sandbox', namespace: 'default' },
        spec: { type: 'sandbox', lifecycle: 'active', owner: 'group:default/team-a' },
      };
      const emit = jest.fn() as jest.MockedFunction<CatalogProcessorEmit>;

      await processor.postProcessEntity!(entity, location, emit, {} as any);

      expect(emit).toHaveBeenCalledTimes(2);
      expect(emit).toHaveBeenCalledWith({
        type: 'relation',
        relation: {
          type: RELATION_OWNED_BY,
          source: { kind: 'Playground', namespace: 'default', name: 'my-sandbox' },
          target: { kind: 'group', namespace: 'default', name: 'team-a' },
        },
      });
      expect(emit).toHaveBeenCalledWith({
        type: 'relation',
        relation: {
          type: RELATION_OWNER_OF,
          source: { kind: 'group', namespace: 'default', name: 'team-a' },
          target: { kind: 'Playground', namespace: 'default', name: 'my-sandbox' },
        },
      });
    });

    it('does not emit relationships for non-Playground entities', async () => {
      const entity: Entity = {
        apiVersion: 'backstage.io/v1alpha1',
        kind: 'Component',
        metadata: { name: 'test', namespace: 'default' },
        spec: { type: 'service', lifecycle: 'production', owner: 'group:default/team-a' },
      };
      const emit = jest.fn() as jest.MockedFunction<CatalogProcessorEmit>;

      await processor.postProcessEntity!(entity, location, emit, {} as any);

      expect(emit).not.toHaveBeenCalled();
    });
  });
});
