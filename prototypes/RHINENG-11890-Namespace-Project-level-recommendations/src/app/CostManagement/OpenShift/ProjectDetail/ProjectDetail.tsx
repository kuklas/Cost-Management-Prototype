import * as React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  CardTitle,
  Flex,
  FlexItem,
  Breadcrumb,
  BreadcrumbItem,
  Tabs,
  Tab,
  TabContent,
  TabTitleText,
  Button,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Grid,
  GridItem,
  Progress,
  List,
  ListItem,
  Label,
  Divider,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  ToolbarToggleGroup,
  SearchInput,
  Pagination,
  PaginationVariant,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import { FilterIcon, ExportIcon, TrendDownIcon, TrendUpIcon } from '@patternfly/react-icons';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { dataService } from '@app/data/dataService';

const ProjectDetail: React.FunctionComponent = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = React.useState<string | number>(3);
  const [currencyOpen, setCurrencyOpen] = React.useState(false);
  const [currency, setCurrency] = React.useState('USD ($) - United States Dollar');
  const [optimizeForOpen, setOptimizeForOpen] = React.useState(false);
  const [optimizeFor, setOptimizeFor] = React.useState('Performance');
  const [timeRangeOpen, setTimeRangeOpen] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('Last 24 hrs');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filter, setFilter] = React.useState('Container names');
  const [filterModeOpen, setFilterModeOpen] = React.useState(false);
  const [filterMode, setFilterMode] = React.useState('Includes');
  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [overheadOpen, setOverheadOpen] = React.useState(false);
  const [overhead, setOverhead] = React.useState('Distribute through cost models');

  // Check if we should open optimizations tab from query param
  React.useEffect(() => {
    if (searchParams.get('optimizationsTab') === 'true') {
      setActiveTab(3);
    }
  }, [searchParams]);

  const handleTabClick = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
    tabIndex: string | number
  ) => {
    setActiveTab(tabIndex);
  };

  // Get project data from database
  const project = dataService.getProjectById(projectId || '');
  
  // If project not found, show error
  if (!project) {
    return (
      <PageSection>
        <Title headingLevel="h1">Project not found</Title>
        <p>The project with ID "{projectId}" was not found.</p>
        <Link to="/cost-management/openshift">Back to OpenShift</Link>
      </PageSection>
    );
  }

  // Get related cluster
  const cluster = dataService.getClusterById(project.clusterId);

  // Transform project data for the UI
  const projectData = {
    name: project.name,
    displayName: searchParams.get('breakdown_title') || project.name,
    id: project.id,
    totalCost: dataService.formatCurrency(project.cost),
    dateRange: 'October 1 – 24',
    clusterName: cluster?.displayName || 'Unknown',
    projectType: 'namespace',
    optimizations: 3, // Mock data - would come from API
  };

  // Mock workloads data
  const workloads = [
    { name: 'grafana-deployment', cost: dataService.formatCurrency(project.cost * 0.4), percentage: 40 },
    { name: 'thanos-querier', cost: dataService.formatCurrency(project.cost * 0.3), percentage: 30 },
    { name: 'thanos-receive', cost: dataService.formatCurrency(project.cost * 0.2), percentage: 20 },
    { name: '2 Others', cost: dataService.formatCurrency(project.cost * 0.1), percentage: 10 },
  ];

  // Mock containers data for optimizations
  const containersData = [
    {
      id: 'c1',
      containerName: 'manager',
      workloadName: 'thanos-receive',
      workloadType: 'statefulset',
      clusterName: 'demolab',
      currentMemory: '64MiB',
      currentCPU: '300mcore',
      memoryChange: -12,
      cpuChange: +12,
      lastReported: '3 hours ago',
    },
    {
      id: 'c2',
      containerName: 'proxy',
      workloadName: 'thanos-receive',
      workloadType: 'statefulset',
      clusterName: 'demolab',
      currentMemory: '32MiB',
      currentCPU: '150mcore',
      memoryChange: -8,
      cpuChange: +10,
      lastReported: '3 hours ago',
    },
    {
      id: 'c3',
      containerName: 'oauth-proxy',
      workloadName: 'cost-mgmt-proxy',
      workloadType: 'deployment',
      clusterName: 'demolab',
      currentMemory: '128MiB',
      currentCPU: '500mcore',
      memoryChange: -15,
      cpuChange: +8,
      lastReported: '3 hours ago',
    },
    {
      id: 'c4',
      containerName: 'grafana',
      workloadName: 'grafana-deployment',
      workloadType: 'deployment',
      clusterName: 'demolab',
      currentMemory: '256MiB',
      currentCPU: '800mcore',
      memoryChange: -20,
      cpuChange: +15,
      lastReported: '3 hours ago',
    },
    {
      id: 'c5',
      containerName: 'grafana-operator',
      workloadName: 'grafana-operator-controller-manager',
      workloadType: 'deployment',
      clusterName: 'demolab',
      currentMemory: '64MiB',
      currentCPU: '200mcore',
      memoryChange: -10,
      cpuChange: +5,
      lastReported: '3 hours ago',
    },
  ];

  const totalContainers = 500;

  return (
    <>
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
              <BreadcrumbItem to="/cost-management/openshift">OpenShift</BreadcrumbItem>
            </Breadcrumb>
          </FlexItem>
        </Flex>
      </PageSection>

      <PageSection style={{
        paddingBottom: 0,
        backgroundColor: 'var(--pf-t--global--background--color--primary--default)'
      }}>
        <div style={{ paddingBottom: 'var(--pf-t--global--spacer--sm)' }}>
          <nav aria-label="Back to details" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center' }}>
              <li>
                <Link to="/cost-management/openshift?filter[limit]=10&filter[offset]=0&filter[time_scope_value]=-1&group_by[project]=*">
                  Back to OpenShift project details
                </Link>
              </li>
            </ol>
          </nav>

          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
            <FlexItem>
              <Title headingLevel="h1" size="2xl" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                {projectData.displayName}
              </Title>
              <div style={{ 
                fontSize: 'var(--pf-t--global--font--size--body--default)', 
                color: 'var(--pf-t--global--text--color--subtle)',
                marginBottom: 'var(--pf-t--global--spacer--xs)'
              }}>
                {projectData.dateRange} • Cluster: {projectData.clusterName}
              </div>
            </FlexItem>
            <FlexItem>
              <Select
                isOpen={currencyOpen}
                onSelect={(_event, value) => {
                  setCurrency(value as string);
                  setCurrencyOpen(false);
                }}
                onOpenChange={(isOpen) => setCurrencyOpen(isOpen)}
                selected={currency}
                toggle={(toggleRef) => (
                  <MenuToggle 
                    ref={toggleRef} 
                    onClick={() => setCurrencyOpen(!currencyOpen)} 
                    isExpanded={currencyOpen}
                  >
                    {currency}
                  </MenuToggle>
                )}
              >
                <SelectList>
                  <SelectOption value="USD ($) - United States Dollar">
                    USD ($) - United States Dollar
                  </SelectOption>
                </SelectList>
              </Select>
            </FlexItem>
          </Flex>
        </div>
      </PageSection>

      <PageSection style={{ paddingTop: 0 }}>
        {/* Overhead cost selector */}
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          <FlexItem>
            <Title headingLevel="h2" size="md">
              Overhead cost
            </Title>
          </FlexItem>
          <FlexItem>
            <Select
              isOpen={overheadOpen}
              onSelect={(_event, value) => {
                setOverhead(value as string);
                setOverheadOpen(false);
              }}
              onOpenChange={(isOpen) => setOverheadOpen(isOpen)}
              selected={overhead}
              toggle={(toggleRef) => (
                <MenuToggle 
                  ref={toggleRef} 
                  onClick={() => setOverheadOpen(!overheadOpen)} 
                  isExpanded={overheadOpen}
                >
                  {overhead}
                </MenuToggle>
              )}
            >
              <SelectList>
                <SelectOption value="Distribute through cost models">Distribute through cost models</SelectOption>
                <SelectOption value="Do not distribute">Do not distribute</SelectOption>
              </SelectList>
            </Select>
          </FlexItem>
        </Flex>

        <Tabs
          activeKey={activeTab}
          onSelect={handleTabClick}
          aria-label="Project details tabs"
          role="region"
          style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}
        >
          <Tab
            eventKey={0}
            title={<TabTitleText>Cost overview</TabTitleText>}
            tabContentId="cost-overview-tab"
            isDisabled={true}
          />
          <Tab
            eventKey={1}
            title={<TabTitleText>Historical data</TabTitleText>}
            tabContentId="historical-data-tab"
            isDisabled={true}
          />
          <Tab
            eventKey={2}
            title={<TabTitleText>Virtualization</TabTitleText>}
            tabContentId="virtualization-tab"
            isDisabled={true}
          />
          <Tab
            eventKey={3}
            title={
              <TabTitleText>
                Optimizations <Label color="blue" isCompact>{containersData.length + 1}</Label>
              </TabTitleText>
            }
            tabContentId="optimizations-tab"
          />
        </Tabs>

        <TabContent eventKey={3} id="optimizations-tab" hidden={activeTab !== 3}>
          {/* Optimize controls */}
          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsLg' }} style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <Title headingLevel="h2" size="md">
                  Optimize for
                </Title>
                <Select
                  isOpen={optimizeForOpen}
                  onSelect={(_event, value) => {
                    setOptimizeFor(value as string);
                    setOptimizeForOpen(false);
                  }}
                  onOpenChange={(isOpen) => setOptimizeForOpen(isOpen)}
                  selected={optimizeFor}
                  toggle={(toggleRef) => (
                    <MenuToggle 
                      ref={toggleRef} 
                      onClick={() => setOptimizeForOpen(!optimizeForOpen)} 
                      isExpanded={optimizeForOpen}
                    >
                      {optimizeFor}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="Performance">Performance</SelectOption>
                    <SelectOption value="Cost">Cost</SelectOption>
                  </SelectList>
                </Select>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <Title headingLevel="h2" size="md">
                  View optimizations based on
                </Title>
                <Select
                  isOpen={timeRangeOpen}
                  onSelect={(_event, value) => {
                    setTimeRange(value as string);
                    setTimeRangeOpen(false);
                  }}
                  onOpenChange={(isOpen) => setTimeRangeOpen(isOpen)}
                  selected={timeRange}
                  toggle={(toggleRef) => (
                    <MenuToggle 
                      ref={toggleRef} 
                      onClick={() => setTimeRangeOpen(!timeRangeOpen)} 
                      isExpanded={timeRangeOpen}
                    >
                      {timeRange}
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="Last 24 hrs">Last 24 hrs</SelectOption>
                    <SelectOption value="Last 7 days">Last 7 days</SelectOption>
                    <SelectOption value="Last 14 days">Last 14 days</SelectOption>
                  </SelectList>
                </Select>
              </Flex>
            </FlexItem>
          </Flex>

          {/* Project-level optimization */}
          <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Optimization for this project
          </Title>
          <Card style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}>
            <CardBody>
              <Table aria-label="Project optimization table" variant="compact">
                <Thead>
                  <Tr>
                    <Th>Project names</Th>
                    <Th>Project types</Th>
                    <Th>Cluster names</Th>
                    <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)' }}>
                      Memory Requests
                    </Th>
                    <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)' }}>
                      CPU Requests
                    </Th>
                    <Th>Last reported</Th>
                  </Tr>
                  <Tr>
                    <Th></Th>
                    <Th></Th>
                    <Th></Th>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                      Current
                    </Th>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                      Change
                    </Th>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                      Current
                    </Th>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                      Change
                    </Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{projectData.name}</Td>
                    <Td>namespace</Td>
                    <Td>{projectData.clusterName}</Td>
                    <Td>64MiB</Td>
                    <Td>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <TrendDownIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
                        </FlexItem>
                        <FlexItem>-12%</FlexItem>
                      </Flex>
                    </Td>
                    <Td>250mcore</Td>
                    <Td>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <TrendUpIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                        </FlexItem>
                        <FlexItem>+12%</FlexItem>
                      </Flex>
                    </Td>
                    <Td>3 hours ago</Td>
                  </Tr>
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          {/* Container-level optimizations */}
          <Divider style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }} />
          <Title headingLevel="h2" size="lg" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            Optimizable containers on this project
          </Title>
          <Card>
            <CardBody>
              <Toolbar id="container-optimizations-toolbar">
                <ToolbarContent>
                  <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                    <ToolbarGroup variant="filter-group">
                      <ToolbarItem>
                        <Select
                          isOpen={filterOpen}
                          onSelect={(_event, value) => {
                            setFilter(value as string);
                            setFilterOpen(false);
                          }}
                          onOpenChange={(isOpen) => setFilterOpen(isOpen)}
                          selected={filter}
                          toggle={(toggleRef) => (
                            <MenuToggle 
                              ref={toggleRef} 
                              onClick={() => setFilterOpen(!filterOpen)} 
                              isExpanded={filterOpen}
                              icon={<FilterIcon />}
                            >
                              {filter}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="Container names">Container names</SelectOption>
                            <SelectOption value="Workload names">Workload names</SelectOption>
                            <SelectOption value="Workload types">Workload types</SelectOption>
                            <SelectOption value="Cluster names">Cluster names</SelectOption>
                          </SelectList>
                        </Select>
                      </ToolbarItem>
                      <ToolbarItem>
                        <Select
                          isOpen={filterModeOpen}
                          onSelect={(_event, value) => {
                            setFilterMode(value as string);
                            setFilterModeOpen(false);
                          }}
                          onOpenChange={(isOpen) => setFilterModeOpen(isOpen)}
                          selected={filterMode}
                          toggle={(toggleRef) => (
                            <MenuToggle 
                              ref={toggleRef} 
                              onClick={() => setFilterModeOpen(!filterModeOpen)} 
                              isExpanded={filterModeOpen}
                            >
                              {filterMode}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="Includes">Includes</SelectOption>
                            <SelectOption value="Excludes">Excludes</SelectOption>
                          </SelectList>
                        </Select>
                      </ToolbarItem>
                      <ToolbarItem>
                        <SearchInput
                          placeholder={`Filter by ${filter.toLowerCase()}`}
                          value={searchValue}
                          onChange={(_event, value) => setSearchValue(value)}
                          onClear={() => setSearchValue('')}
                        />
                      </ToolbarItem>
                    </ToolbarGroup>
                  </ToolbarToggleGroup>
                  <ToolbarItem>
                    <Tooltip content="Export">
                      <Button variant="plain" aria-label="Export">
                        <ExportIcon />
                      </Button>
                    </Tooltip>
                  </ToolbarItem>
                  <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                    <Pagination
                      itemCount={totalContainers}
                      perPage={perPage}
                      page={page}
                      onSetPage={(_evt, newPage) => setPage(newPage)}
                      widgetId="container-pagination-top"
                      onPerPageSelect={(_evt, newPerPage, newPage) => {
                        setPerPage(newPerPage);
                        setPage(newPage);
                      }}
                      isCompact
                    />
                  </ToolbarItem>
                </ToolbarContent>
              </Toolbar>

              <Table aria-label="Optimizable containers table" variant="compact">
                <Thead>
                  <Tr>
                    <Th rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                      Container names
                    </Th>
                    <Th rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                      Workload names
                    </Th>
                    <Th rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                      Workload types
                    </Th>
                    <Th rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                      Cluster names
                    </Th>
                    <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)', backgroundColor: 'white', paddingTop: 'var(--pf-t--global--spacer--sm)', paddingBottom: '4px' }}>
                      Memory Requests
                    </Th>
                    <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)', backgroundColor: 'white', paddingTop: 'var(--pf-t--global--spacer--sm)', paddingBottom: '4px' }}>
                      CPU Requests
                    </Th>
                    <Th rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                      Last reported
                    </Th>
                  </Tr>
                  <Tr>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                      Current
                    </Th>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                      Change
                    </Th>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                      Current
                    </Th>
                    <Th style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                      Change
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {containersData.map((container) => (
                    <Tr key={container.id}>
                      <Td>{container.containerName}</Td>
                      <Td>{container.workloadName}</Td>
                      <Td>{container.workloadType}</Td>
                      <Td>{container.clusterName}</Td>
                      <Td>{container.currentMemory}</Td>
                      <Td>
                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            {container.memoryChange < 0 ? (
                              <TrendDownIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
                            ) : (
                              <TrendUpIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                            )}
                          </FlexItem>
                          <FlexItem>{container.memoryChange}%</FlexItem>
                        </Flex>
                      </Td>
                      <Td>{container.currentCPU}</Td>
                      <Td>
                        <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                          <FlexItem>
                            {container.cpuChange < 0 ? (
                              <TrendDownIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
                            ) : (
                              <TrendUpIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                            )}
                          </FlexItem>
                          <FlexItem>+{container.cpuChange}%</FlexItem>
                        </Flex>
                      </Td>
                      <Td>{container.lastReported}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <div style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
                <Pagination
                  itemCount={totalContainers}
                  perPage={perPage}
                  page={page}
                  onSetPage={(_evt, newPage) => setPage(newPage)}
                  widgetId="container-pagination-bottom"
                  onPerPageSelect={(_evt, newPerPage, newPage) => {
                    setPerPage(newPerPage);
                    setPage(newPage);
                  }}
                  variant={PaginationVariant.bottom}
                />
              </div>
            </CardBody>
          </Card>
        </TabContent>
      </PageSection>
    </>
  );
};

export { ProjectDetail };

