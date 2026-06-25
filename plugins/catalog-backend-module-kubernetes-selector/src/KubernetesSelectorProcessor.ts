import { CatalogProcessor } from '@backstage/plugin-catalog-node';
import { Entity } from '@backstage/catalog-model';

const KUBERNETES_LABEL_SELECTOR_ANNOTATION =
  'backstage.io/kubernetes-label-selector';

export class KubernetesSelectorProcessor implements CatalogProcessor {
  getProcessorName(): string {
    return 'KubernetesSelectorProcessor';
  }

  async preProcessEntity(entity: Entity): Promise<Entity> {
    if (entity.kind !== 'Component') {
      return entity;
    }

    if (entity.metadata.annotations?.[KUBERNETES_LABEL_SELECTOR_ANNOTATION]) {
      return entity;
    }

    const name = entity.metadata.name;

    if (!entity.metadata.annotations) {
      entity.metadata.annotations = {};
    }

    entity.metadata.annotations[KUBERNETES_LABEL_SELECTOR_ANNOTATION] =
      `backstage.io/kubernetes-id=${name}`;

    return entity;
  }
}
