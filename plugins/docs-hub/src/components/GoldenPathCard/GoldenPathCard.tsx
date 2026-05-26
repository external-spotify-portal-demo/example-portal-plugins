import { Entity } from '@backstage/catalog-model';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Flex,
  Box,
  Tag,
  TagGroup,
} from '@backstage/ui';
import { Link } from '@backstage/core-components';
import { RiFileTextLine, RiUserLine } from '@remixicon/react';
import styles from './GoldenPathCard.module.css';

export const GoldenPathCard = ({ entity }: { entity: Entity }) => {
  const entityLink = docsPath(entity);

  const owner = (entity.spec as { owner?: string })?.owner;
  const tags = entity.metadata.tags ?? [];

  return (
    <Card className={styles.card}>
      <CardHeader>
        <Flex align="center" style={{ gap: 'var(--bui-space-3)' }}>
          <Box className={styles.iconWrapper}>
            <RiFileTextLine size={22} />
          </Box>
          <Flex direction="column" style={{ gap: 'var(--bui-space-1)' }}>
            <Text variant="title-small">
              {entity.metadata.title ?? entity.metadata.name}
            </Text>
            {owner && (
              <Flex align="center" style={{ gap: 'var(--bui-space-1)' }}>
                <RiUserLine size={14} color="var(--bui-fg-secondary)" />
                <Text variant="body-small" color="secondary">
                  {owner}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </CardHeader>
      <CardBody className={styles.body}>
        <Flex direction="column" style={{ gap: 'var(--bui-space-3)' }}>
          {entity.metadata.description && (
            <Text variant="body-medium" color="secondary">
              {entity.metadata.description}
            </Text>
          )}
          {tags.length > 0 && (
            <TagGroup>
              {tags.map(tag => (
                <Tag size="small" key={tag}>
                  {tag}
                </Tag>
              ))}
            </TagGroup>
          )}
        </Flex>
      </CardBody>
      <CardFooter>
        <Link to={entityLink}>View Docs</Link>
      </CardFooter>
    </Card>
  );
};

function docsPath(entity: Entity) {
  const kind = entity.kind.toLowerCase();
  const namespace = (entity.metadata.namespace ?? 'default').toLowerCase();
  const name = entity.metadata.name.toLowerCase();
  return `/docs/${namespace}/${kind}/${name}`;
}
