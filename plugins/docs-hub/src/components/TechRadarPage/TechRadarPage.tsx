import { Container, Flex, Text } from '@backstage/ui';
import { TechRadarComponent } from '@backstage-community/plugin-tech-radar';

export const TechRadarPage = () => {
  return (
    <Container>
      <Flex direction="column" style={{ gap: 'var(--bui-space-6)' }}>
        <Flex direction="column" style={{ gap: 'var(--bui-space-2)' }} pt="4">
          <Text variant="title-medium">Assess, adopt, hold.</Text>
          <Text variant="body-medium" color="secondary">
            Our technology landscape at a glance — see what's recommended, what's
            being evaluated, and what's on its way out.
          </Text>
        </Flex>
        <TechRadarComponent />
      </Flex>
    </Container>
  );
};
