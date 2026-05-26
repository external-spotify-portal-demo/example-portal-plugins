import { useApi } from '@backstage/frontend-plugin-api';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';
import { Container, Flex, Grid, Text, Alert, Skeleton } from '@backstage/ui';
import useAsync from 'react-use/esm/useAsync';
import { GoldenPathCard } from '../GoldenPathCard';

export const GoldenPathPage = () => {
  const catalogApi = useApi(catalogApiRef);

  const {
    value: entities,
    loading,
    error,
  } = useAsync(async () => {
    const { items } = await catalogApi.queryEntities({
      filter: {
        'metadata.annotations.backstage.io/techdocs-ref': CATALOG_FILTER_EXISTS,
      },
      orderFields: [{ field: 'metadata.name', order: 'asc' }],
      limit: 6,
    });
    return items;
  }, [catalogApi]);

  if (loading) {
    return (
      <Container>
        <Grid.Root columns={{ sm: '12' }} gap="4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid.Item colSpan={{ sm: '12', md: '4' }} key={i}>
              <Skeleton width="100%" height={180} />
            </Grid.Item>
          ))}
        </Grid.Root>
      </Container>
    );
  }

  return (
    <Container>
      <Flex direction="column" style={{ gap: 'var(--bui-space-6)' }}>
        <Flex direction="column" style={{ gap: 'var(--bui-space-2)' }} pt="4">
          <Text variant="title-medium">Follow proven patterns.</Text>
          <Text variant="body-medium" color="secondary">
            Recommended guides and documentation to help you build on what
            works.
          </Text>
        </Flex>

        {error && (
          <Alert
            status="danger"
            icon
            title="Failed to load Golden Paths"
            description={error.message}
          />
        )}

        <Grid.Root columns={{ sm: '12' }} gap="4">
          {entities?.map(entity => (
            <Grid.Item
              colSpan={{ sm: '12', md: '4' }}
              key={entity.metadata.name}
            >
              <GoldenPathCard entity={entity} />
            </Grid.Item>
          ))}
        </Grid.Root>
      </Flex>
    </Container>
  );
};
