import * as React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  ToolbarToggleGroup,
  MenuToggle,
  Select,
  SelectOption,
  SelectList,
  SearchInput,
  Button,
  Pagination,
  PaginationVariant,
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import { FilterIcon, OutlinedQuestionCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

interface OptimizationItem {
  id: string;
  containerName: string;
  projectName: string;
  workloadName: string;
  workloadType: string;
  clusterName: string;
  lastReported: string;
}

const Optimizations: React.FunctionComponent = () => {
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [category, setCategory] = React.useState('Container');
  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortIndex, setSortIndex] = React.useState<number>(5);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');

  // Mock data
  const optimizations: OptimizationItem[] = [
    {
      id: 'a155a08a-b48d-494d-a2ca-e4e003b456f3',
      containerName: 'cuda-nbody',
      projectName: 'gpu-testing',
      workloadName: 'cuda-nbody-test',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: '318be493-405a-4e6d-b42b-b3b5cf980d49',
      containerName: 'grafana',
      projectName: 'thanos',
      workloadName: 'grafana-deployment',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: 'df3bc208-f287-4cb7-954c-8e40fda136a8',
      containerName: 'kube-rbac-proxy',
      projectName: 'thanos',
      workloadName: 'grafana-operator-controller-manager',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: 'bbbfc028-f8fe-4743-b3fc-211929502464',
      containerName: 'manager',
      projectName: 'thanos',
      workloadName: 'grafana-operator-controller-manager',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: '882ef545-219c-44eb-800c-3cb7d793f061',
      containerName: 'oauth-proxy',
      projectName: 'thanos',
      workloadName: 'thanos-querier',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: '65bfad47-baa6-4918-b585-0a42876d9165',
      containerName: 'thanos',
      projectName: 'thanos',
      workloadName: 'thanos-querier',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: 'ad991337-6e5c-43f0-b6c8-afa2820ec47a',
      containerName: 'oauth-proxy',
      projectName: 'thanos',
      workloadName: 'thanos-receive',
      workloadType: 'statefulset',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: 'f4457acf-73f4-4563-b779-a3877de4a83f',
      containerName: 'thanos-receive',
      projectName: 'thanos',
      workloadName: 'thanos-receive',
      workloadType: 'statefulset',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: 'dd123ac5-3c84-41b6-b4b3-c0f1e9f354c8',
      containerName: 'nginx-proxy',
      projectName: 'costmanagement-metrics-operator',
      workloadName: 'cost-mgmt-proxy',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
    {
      id: '1b4d71db-f1e2-4671-bec1-ee064b371a56',
      containerName: 'manager',
      projectName: 'costmanagement-metrics-operator',
      workloadName: 'costmanagement-metrics-operator',
      workloadType: 'deployment',
      clusterName: 'demolab',
      lastReported: '1 hour ago',
    },
  ];

  const totalItems = 56;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;

  const getSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: sortIndex,
      direction: sortDirection,
    },
    onSort: (_event, index, direction) => {
      setSortIndex(index);
      setSortDirection(direction);
    },
    columnIndex,
  });

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
              <BreadcrumbItem to="/cost-management/optimizations" isActive>Optimizations</BreadcrumbItem>
            </Breadcrumb>
          </FlexItem>
          <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
            {/* Placeholder for favorite icon */}
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Header Section */}
      <PageSection style={{ paddingBottom: 0 }}>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <Title headingLevel="h1" size="2xl" style={{ paddingBottom: 'var(--pf-t--global--spacer--sm)' }}>
            Optimizations
          </Title>
          <Button variant="plain" aria-label="A dialog with a description of optimizations">
            <OutlinedQuestionCircleIcon />
          </Button>
        </Flex>
      </PageSection>

      {/* Main Content */}
      <PageSection>
        <Card>
          <CardBody>
            {/* Toolbar */}
            <Toolbar id="optimizations-toolbar">
              <ToolbarContent>
                <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                  <ToolbarGroup variant="filter-group">
                    <ToolbarItem>
                      <Select
                        isOpen={categoryOpen}
                        onSelect={() => setCategoryOpen(false)}
                        onOpenChange={(isOpen) => setCategoryOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle 
                            ref={toggleRef} 
                            onClick={() => setCategoryOpen(!categoryOpen)} 
                            isExpanded={categoryOpen}
                            icon={<FilterIcon />}
                          >
                            {category}
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          <SelectOption value="Container">Container</SelectOption>
                          <SelectOption value="Project">Project</SelectOption>
                          <SelectOption value="Workload">Workload</SelectOption>
                        </SelectList>
                      </Select>
                    </ToolbarItem>
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Filter by container"
                        value={searchValue}
                        onChange={(_event, value) => setSearchValue(value)}
                        onClear={() => setSearchValue('')}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarToggleGroup>
                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={totalItems}
                    perPage={perPage}
                    page={page}
                    onSetPage={(_evt, newPage) => setPage(newPage)}
                    widgetId="optimizations-pagination-top"
                    onPerPageSelect={(_evt, newPerPage, newPage) => {
                      setPerPage(newPerPage);
                      setPage(newPage);
                    }}
                    isCompact
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>

            {/* Table */}
            <Table aria-label="Optimizations table" variant="compact" gridBreakPoint="grid-2xl">
              <Thead>
                <Tr>
                  <Th sort={getSortParams(0)}>Container names</Th>
                  <Th sort={getSortParams(1)}>Project names</Th>
                  <Th sort={getSortParams(2)}>Workload names</Th>
                  <Th sort={getSortParams(3)}>Workload types</Th>
                  <Th sort={getSortParams(4)}>Cluster names</Th>
                  <Th 
                    sort={getSortParams(5)} 
                    modifier="nowrap"
                    style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}
                  >
                    Last reported
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {optimizations.map((item) => (
                  <Tr key={item.id}>
                    <Td dataLabel="Container names" modifier="nowrap">
                      <Link 
                        to={`/cost-management/optimizations/breakdown?breadcrumb_label=Back to optimizations&breakdown_title=${item.containerName}&id=${item.id}&isOptimizationsDetails=true`}
                      >
                        {item.containerName}
                      </Link>
                    </Td>
                    <Td dataLabel="Project names" modifier="nowrap">{item.projectName}</Td>
                    <Td dataLabel="Workload names" modifier="nowrap">{item.workloadName}</Td>
                    <Td dataLabel="Workload types" modifier="nowrap">{item.workloadType}</Td>
                    <Td dataLabel="Cluster names" modifier="nowrap">{item.clusterName}</Td>
                    <Td 
                      dataLabel="Last reported" 
                      modifier="nowrap"
                      style={{ textAlign: 'right', paddingRight: '3.8rem' }}
                    >
                      {item.lastReported}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {/* Bottom Pagination */}
            <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
              <Pagination
                itemCount={totalItems}
                perPage={perPage}
                page={page}
                onSetPage={(_evt, newPage) => setPage(newPage)}
                widgetId="optimizations-pagination-bottom"
                onPerPageSelect={(_evt, newPerPage, newPage) => {
                  setPerPage(newPerPage);
                  setPage(newPage);
                }}
                variant={PaginationVariant.bottom}
                isCompact={false}
              />
            </div>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
};

export { Optimizations };

