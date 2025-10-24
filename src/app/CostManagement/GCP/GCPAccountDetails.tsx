import * as React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  CardTitle,
  Grid,
  GridItem,
  Flex,
  FlexItem,
  Breadcrumb,
  BreadcrumbItem,
  MenuToggle,
  Select,
  SelectOption,
  SelectList,
  Tabs,
  Tab,
  TabTitleText,
  TabContent,
  Button,
  Progress,
  ProgressSize,
} from '@patternfly/react-core';
import { AngleLeftIcon, TagIcon, OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { Link, useParams } from 'react-router-dom';
import { dataService } from '@app/data/dataService';

const GCPAccountDetails: React.FunctionComponent = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const [currencyOpen, setCurrencyOpen] = React.useState(false);
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTabKey(tabIndex);
  };

  // Get account data from database
  const account = dataService.getGCPAccountById(accountId || '');

  // If account not found, show error
  if (!account) {
    return (
      <PageSection>
        <Title headingLevel="h1">Account not found</Title>
        <p>The GCP account with ID "{accountId}" was not found.</p>
        <Link to="/cost-management/gcp">Back to Google Cloud</Link>
      </PageSection>
    );
  }

  const accountData = {
    name: account.displayName,
    id: account.billingAccountId,
    totalCost: dataService.formatCurrency(account.cost),
    dateRange: 'October 1 – 24',
    tagCount: 18, // Placeholder
  };

  return (
    <>
      {/* Breadcrumb Section */}
      <PageSection
        style={{
          paddingBottom: 0,
          paddingTop: 'var(--pf-t--global--spacer--sm)',
          backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
        }}
      >
        <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
          <FlexItem flex={{ default: 'flex_1' }}>
            <Breadcrumb style={{ paddingTop: 'var(--pf-t--global--spacer--sm)' }}>
              <BreadcrumbItem to="/">OpenShift</BreadcrumbItem>
              <BreadcrumbItem to="/cost-management/overview">Cost Management</BreadcrumbItem>
              <BreadcrumbItem to="/cost-management/gcp" isActive>Google Cloud</BreadcrumbItem>
            </Breadcrumb>
          </FlexItem>
          <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
            {/* Placeholder for favorite icon */}
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Header Section */}
      <PageSection style={{
        paddingBottom: 'var(--pf-t--global--spacer--lg)',
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
      }}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
          {/* Back link and Currency Row */}
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ alignItems: 'unset', minHeight: '36px' }}>
            <FlexItem>
              <nav aria-label="Back to details">
                <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    <AngleLeftIcon style={{ marginRight: 'var(--pf-t--global--spacer--xs)' }} />
                    <Link to="/cost-management/gcp">Back to Google Cloud account details</Link>
                  </li>
                </ol>
              </nav>
            </FlexItem>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <Title headingLevel="h2" size="md" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
                  Currency
                </Title>
                <div style={{ minWidth: '280px' }}>
                  <Select
                    isOpen={currencyOpen}
                    onSelect={() => setCurrencyOpen(false)}
                    onOpenChange={(isOpen) => setCurrencyOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle ref={toggleRef} onClick={() => setCurrencyOpen(!currencyOpen)} isExpanded={currencyOpen} style={{ width: '100%' }}>
                        USD ($) - United States Dollar
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="USD ($) - United States Dollar">USD ($) - United States Dollar</SelectOption>
                    </SelectList>
                  </Select>
                </div>
              </Flex>
            </FlexItem>
          </Flex>

          {/* Account Name and Total Cost Row */}
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ alignItems: 'unset', paddingBottom: 'var(--pf-t--global--spacer--sm)', paddingLeft: '1px', paddingTop: 'var(--pf-t--global--spacer--xs)' }}>
            <FlexItem>
              <Flex direction={{ default: 'column' }}>
                <Title headingLevel="h1" size="2xl">{accountData.name}</Title>
              </Flex>
            </FlexItem>
            <FlexItem>
              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                <Title headingLevel="h2" size="4xl" style={{ marginTop: 0, marginBottom: 0, textAlign: 'right' }}>
                  <span>{accountData.totalCost}</span>
                </Title>
                <div style={{ textAlign: 'right' }}>Accounts total cost ({accountData.dateRange})</div>
              </div>
            </FlexItem>
          </Flex>

          {/* Tabs and Tags Row */}
          <div style={{ display: 'flex' }}>
            <Tabs activeKey={activeTabKey} onSelect={handleTabClick}>
              <Tab eventKey={0} title={<TabTitleText>Cost overview</TabTitleText>} />
              <Tab eventKey={1} title={<TabTitleText>Historical data</TabTitleText>} />
            </Tabs>
            <div style={{ marginLeft: 'var(--pf-t--global--spacer--lg)', marginTop: 'var(--pf-t--global--spacer--xs)' }}>
              <div id="tags" style={{ marginRight: '4rem', marginTop: '0.5rem' }}>
                <TagIcon />
                <Link to="#" style={{ marginLeft: '0.5rem' }}>18</Link>
              </div>
            </div>
          </div>
        </Flex>
      </PageSection>

      {/* Main Content - Cost overview tab */}
      <PageSection>
        <TabContent eventKey={0} id="cost-overview-content" activeKey={activeTabKey} hidden={activeTabKey !== 0}>
          <Grid hasGutter>
            {/* Left Column */}
            <GridItem span={12} xl={6} xl2={6}>
              <Grid hasGutter>
                {/* Cost breakdown card */}
                <GridItem>
                  <Card>
                    <CardTitle>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <Title headingLevel="h2" size="lg">Cost breakdown</Title>
                        <Button variant="plain" aria-label="Cost breakdown information">
                          <OutlinedQuestionCircleIcon />
                        </Button>
                      </Flex>
                    </CardTitle>
                    <CardBody>
                      <div style={{
                        height: '332px',
                        backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 'var(--pf-t--global--border--radius--default)',
                        color: 'var(--pf-t--global--text--color--subtle)'
                      }}>
                        Cost Breakdown Chart
                      </div>
                    </CardBody>
                  </Card>
                </GridItem>

                {/* Cost breakdown by Google Cloud projects */}
                <GridItem>
                  <Card>
                    <CardTitle>
                      <Title headingLevel="h2" size="lg">Cost breakdown by Google Cloud projects</Title>
                    </CardTitle>
                    <CardBody>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <Progress
                            value={100}
                            title="billion-sandwich-555777888"
                            size={ProgressSize.sm}
                            label="$6,564.76  (100 %)"
                          />
                        </li>
                      </ul>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </GridItem>

            {/* Right Column */}
            <GridItem span={12} xl={6} xl2={6}>
              <Grid hasGutter>
                {/* Cost breakdown by services */}
                <GridItem>
                  <Card>
                    <CardTitle>
                      <Title headingLevel="h2" size="lg">Cost breakdown by services</Title>
                    </CardTitle>
                    <CardBody>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <Progress
                            value={92.21}
                            title="Compute Engine"
                            size={ProgressSize.sm}
                            label="$6,053.07  (92.21 %)"
                          />
                        </li>
                        <li style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <Progress
                            value={7.68}
                            title="Storage"
                            size={ProgressSize.sm}
                            label="$504.00  (7.68 %)"
                          />
                        </li>
                        <li style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <Progress
                            value={0.04}
                            title="Cloud SQL"
                            size={ProgressSize.sm}
                            label="$2.61  (0.04 %)"
                          />
                        </li>
                        <li style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <Progress
                            value={0.08}
                            title="2 Others"
                            size={ProgressSize.sm}
                            label="$5.09  (0.08 %)"
                          />
                        </li>
                      </ul>
                    </CardBody>
                    <CardTitle style={{ padding: 'var(--pf-t--global--spacer--md)', borderTop: '1px solid var(--pf-t--global--border--color--default)', marginLeft: '-15px' }}>
                      <Button variant="link">View all Services</Button>
                    </CardTitle>
                  </Card>
                </GridItem>

                {/* Cost breakdown by regions */}
                <GridItem>
                  <Card>
                    <CardTitle>
                      <Title headingLevel="h2" size="lg">Cost breakdown by regions</Title>
                    </CardTitle>
                    <CardBody>
                      <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
                          <Progress
                            value={100}
                            title="us-west1-a"
                            size={ProgressSize.sm}
                            label="$6,564.76  (100 %)"
                          />
                        </li>
                      </ul>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </GridItem>
          </Grid>
        </TabContent>

        {/* Main Content - Historical data tab */}
        <TabContent eventKey={1} id="historical-data-content" activeKey={activeTabKey} hidden={activeTabKey !== 1}>
          <Grid hasGutter>
            {/* Cost comparison */}
            <GridItem>
              <Card>
                <CardTitle>
                  <Title headingLevel="h2" size="lg">Cost comparison</Title>
                </CardTitle>
                <CardBody>
                  <div style={{ marginLeft: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                      <Title headingLevel="h2" size="xl" style={{ marginLeft: '-1.5rem' }}></Title>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{
                          height: '250px',
                          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--pf-t--global--border--radius--default)',
                          color: 'var(--pf-t--global--text--color--subtle)'
                        }}>
                          Cost Comparison Chart (Historical)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </GridItem>

            {/* Compute usage comparison */}
            <GridItem>
              <Card>
                <CardTitle>
                  <Title headingLevel="h2" size="lg">Compute usage comparison</Title>
                </CardTitle>
                <CardBody>
                  <div style={{ marginLeft: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                      <Title headingLevel="h2" size="xl" style={{ marginLeft: '-1.5rem' }}></Title>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{
                          height: '250px',
                          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--pf-t--global--border--radius--default)',
                          color: 'var(--pf-t--global--text--color--subtle)'
                        }}>
                          Compute Usage Chart (Historical)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </GridItem>

            {/* Storage usage comparison */}
            <GridItem>
              <Card>
                <CardTitle>
                  <Title headingLevel="h2" size="lg">Storage usage comparison</Title>
                </CardTitle>
                <CardBody>
                  <div style={{ marginLeft: '1.5rem' }}>
                    <div style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>
                      <Title headingLevel="h2" size="xl" style={{ marginLeft: '-1.5rem' }}></Title>
                      <div style={{ marginTop: '0.5rem' }}>
                        <div style={{
                          height: '250px',
                          backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--pf-t--global--border--radius--default)',
                          color: 'var(--pf-t--global--text--color--subtle)'
                        }}>
                          Storage Usage Chart (Historical)
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        </TabContent>
      </PageSection>
    </>
  );
};

export { GCPAccountDetails };

