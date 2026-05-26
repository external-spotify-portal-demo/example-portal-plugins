import { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Container,
  Grid,
  Text,
  Flex,
  Box,
  Button,
} from '@backstage/ui';
import {
  RiRocketLine,
  RiTeamLine,
  RiShieldCheckLine,
  RiBookOpenLine,
  RiToolsLine,
  RiCustomerServiceLine,
} from '@remixicon/react';
import styles from './OverviewPage.module.css';

export const OverviewPage = () => {
  return (
    <Container>
      <Flex direction="column" style={{ gap: 'var(--bui-space-6)' }}>
        <Flex direction="column" style={{ gap: 'var(--bui-space-2)' }} pt="4">
          <Text variant="title-medium">Build better, ship faster.</Text>
          <Text variant="body-medium" color="secondary">
            Your one-stop guide to building software the right way. Whether
            you're new to the team or looking for a quick reference, start here.
          </Text>
        </Flex>

        <Grid.Root columns={{ sm: '12' }} gap="4">
          <TopicCard
            icon={<RiRocketLine size={22} />}
            title="Getting Started"
            description="Everything you need for your first day — setting up your development environment, access requests, and key tools."

            linkLabel="Start here"
            accentColor="#1db954"
            accentBg="#1db95418"
          />
          <TopicCard
            icon={<RiTeamLine size={22} />}
            title="Team & Culture"
            description="Learn about how we work, team rituals, communication norms, and our engineering values."

            linkLabel="Read more"
            accentColor="#6366f1"
            accentBg="#6366f118"
          />
          <TopicCard
            icon={<RiShieldCheckLine size={22} />}
            title="Security & Compliance"
            description="Security policies, data handling guidelines, incident response procedures, and compliance requirements."

            linkLabel="View policies"
            accentColor="#ef4444"
            accentBg="#ef444418"
          />
          <TopicCard
            icon={<RiBookOpenLine size={22} />}
            title="Architecture & Standards"
            description="Architecture decision records, coding standards, API guidelines, and approved technology choices."

            linkLabel="Explore"
            accentColor="#f59e0b"
            accentBg="#f59e0b18"
          />
          <TopicCard
            icon={<RiToolsLine size={22} />}
            title="Developer Tooling"
            description="CI/CD pipelines, monitoring and observability, feature flags, and local development setup."

            linkLabel="View tools"
            accentColor="#3b82f6"
            accentBg="#3b82f618"
          />
          <TopicCard
            icon={<RiCustomerServiceLine size={22} />}
            title="Support & Escalation"
            description="How to get help, on-call procedures, support channels, and escalation paths for production issues."

            linkLabel="Get help"
            accentColor="#a855f7"
            accentBg="#a855f718"
          />
        </Grid.Root>
      </Flex>
    </Container>
  );
};

function TopicCard(props: {
  icon: ReactNode;
  title: string;
  description: string;
  linkLabel: string;
  accentColor: string;
  accentBg: string;
}) {
  return (
    <Grid.Item colSpan={{ sm: '12', md: '4' }}>
      <Card
        className={styles.card}
        style={
          {
            '--accent-color': props.accentColor,
            '--accent-bg': props.accentBg,
          } as React.CSSProperties
        }
      >
        <CardHeader>
          <Flex align="center" style={{ gap: 'var(--bui-space-3)' }}>
            <Box className={styles.iconWrapper}>{props.icon}</Box>
            <Text variant="title-small">{props.title}</Text>
          </Flex>
        </CardHeader>
        <CardBody>
          <Text variant="body-medium" color="secondary">
            {props.description}
          </Text>
        </CardBody>
        <CardFooter>
          <Button variant="tertiary">{props.linkLabel}</Button>
        </CardFooter>
      </Card>
    </Grid.Item>
  );
}
