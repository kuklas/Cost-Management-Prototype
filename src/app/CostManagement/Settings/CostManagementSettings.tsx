import * as React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  CardTitle,
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
  Tabs,
  Tab,
  TabContent,
  InputGroup,
  InputGroupItem,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Label,
  Checkbox,
  Modal,
  ModalVariant,
  Wizard,
  WizardStep,
  Form,
  FormGroup,
  TextInput,
  TextArea,
  ActionList,
  ActionListItem,
  ActionListGroup,
  Stack,
  StackItem,
  Content,
  Radio,
  List,
  ListItem,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import {
  FilterIcon,
  SearchIcon,
  ArrowRightIcon,
  MinusCircleIcon,
  EllipsisVIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

interface CostModel {
  id: string;
  name: string;
  description: string;
  integration: string;
  assignedIntegrations: number;
  lastUpdated: string;
}

interface TagItem {
  id: string;
  name: string;
  status: 'enabled' | 'disabled';
  integration: string;
}

interface CategoryItem {
  id: string;
  name: string;
  status: 'enabled' | 'disabled';
}

interface PlatformProject {
  id: string;
  name: string;
  isDefault: boolean;
  group: string;
  clusters: string[];
}

const CostManagementSettings: React.FunctionComponent = () => {
  const [activeTab, setActiveTab] = React.useState<string | number>(0);
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortIndex, setSortIndex] = React.useState<number>(0);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Currency tab state
  const [currencyOpen, setCurrencyOpen] = React.useState(false);
  const [showCostAsOpen, setShowCostAsOpen] = React.useState(false);

  // Tags tab state
  const [tagsSubTab, setTagsSubTab] = React.useState<string | number>(0);
  const [tagsPage, setTagsPage] = React.useState(1);
  const [tagsPerPage, setTagsPerPage] = React.useState(10);
  const [tagsCategoryOpen, setTagsCategoryOpen] = React.useState(false);
  const [tagsSearchValue, setTagsSearchValue] = React.useState('');
  const [tagsSortIndex, setTagsSortIndex] = React.useState<number>(1);
  const [tagsSortDirection, setTagsSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectAllTags, setSelectAllTags] = React.useState(false);

  // Categories tab state
  const [categoriesPage, setCategoriesPage] = React.useState(1);
  const [categoriesPerPage, setCategoriesPerPage] = React.useState(10);
  const [categoriesCategoryOpen, setCategoriesCategoryOpen] = React.useState(false);
  const [categoriesSearchValue, setCategoriesSearchValue] = React.useState('');
  const [categoriesSortIndex, setCategoriesSortIndex] = React.useState<number>(1);
  const [categoriesSortDirection, setCategoriesSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectAllCategories, setSelectAllCategories] = React.useState(false);

  // Platform projects tab state
  const [projectsPage, setProjectsPage] = React.useState(1);
  const [projectsPerPage, setProjectsPerPage] = React.useState(10);
  const [projectsCategoryOpen, setProjectsCategoryOpen] = React.useState(false);
  const [projectsSearchValue, setProjectsSearchValue] = React.useState('');
  const [projectsSortIndex, setProjectsSortIndex] = React.useState<number>(3);
  const [projectsSortDirection, setProjectsSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [selectAllProjects, setSelectAllProjects] = React.useState(false);

  // Map tags tab state
  const [mapTagsPage, setMapTagsPage] = React.useState(1);
  const [mapTagsPerPage, setMapTagsPerPage] = React.useState(10);
  const [mapTagsCategoryOpen, setMapTagsCategoryOpen] = React.useState(false);
  const [mapTagsSearchValue, setMapTagsSearchValue] = React.useState('');
  const [mapTagsSortIndex, setMapTagsSortIndex] = React.useState<number>(1);
  const [mapTagsSortDirection, setMapTagsSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [expandedMapTags, setExpandedMapTags] = React.useState<Set<string>>(new Set());

  // Wizard state
  const [isWizardOpen, setIsWizardOpen] = React.useState(false);
  const [wizardName, setWizardName] = React.useState('');
  const [wizardDescription, setWizardDescription] = React.useState('');
  const [wizardIntegrationOpen, setWizardIntegrationOpen] = React.useState(false);
  const [wizardIntegration, setWizardIntegration] = React.useState('');
  const [wizardCurrencyOpen, setWizardCurrencyOpen] = React.useState(false);
  const [wizardCurrency, setWizardCurrency] = React.useState('USD ($) - United States Dollar');
  const [wizardIsDiscount, setWizardIsDiscount] = React.useState(false);
  const [wizardMarkupRate, setWizardMarkupRate] = React.useState('0');
  const [wizardSelectedIntegrations, setWizardSelectedIntegrations] = React.useState<string[]>([]);
  const [wizardIntegrationSearchValue, setWizardIntegrationSearchValue] = React.useState('');

  // Mock AWS integrations data
  const awsIntegrations = [
    { id: 'aws-costlab', name: 'AWS Costlab', assignedCostModel: 'test-dla' },
    { id: 'aws-customer-filtered', name: 'AWS-Customer-Filtered-Data-Demo', assignedCostModel: 'simple' },
    { id: 'aws-dev-nise', name: 'AWS - Dev Nise populator', assignedCostModel: '' },
    { id: 'aws-redhat', name: 'AWS Red Hat Cost Management', assignedCostModel: 'AWS markup' },
  ];

  // Mock data
  const costModels: CostModel[] = [
    {
      id: 'fa5e69fd-f312-4bf4-bc51-66c268336951',
      name: 'advanced',
      description: '',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 1,
      lastUpdated: 'Jun 4, 2025, 13:37 UTC',
    },
    {
      id: 'bf01db62-8946-453a-81b8-388438cf131c',
      name: 'Aplikace',
      description: '',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 0,
      lastUpdated: 'Jun 26, 2025, 07:15 UTC',
    },
    {
      id: '6f868174-9ccd-4a88-b8a5-ff60453dd189',
      name: 'Aplikace',
      description: '',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 0,
      lastUpdated: 'Jul 4, 2025, 08:53 UTC',
    },
    {
      id: '7795f11b-c225-496e-a475-b39863044903',
      name: 'AWS markup',
      description: 'A 100% markup on top of costs provided by AWS',
      integration: 'Amazon Web Services',
      assignedIntegrations: 1,
      lastUpdated: 'Feb 7, 2023, 10:56 UTC',
    },
    {
      id: '7548f6a1-f812-41be-8e92-2bad146b0f08',
      name: 'Azure',
      description: '',
      integration: 'Microsoft Azure',
      assignedIntegrations: 2,
      lastUpdated: 'Jul 4, 2025, 08:14 UTC',
    },
    {
      id: 'a1a02767-0371-4b0c-a7a1-692fe14a076a',
      name: 'AzureClusterCostModel',
      description: '',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 0,
      lastUpdated: 'Jan 16, 2024, 11:19 UTC',
    },
    {
      id: 'd4bb1e96-282b-480a-adbf-bba46abf1d58',
      name: 'Cost Model',
      description: '',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 1,
      lastUpdated: 'May 15, 2025, 21:34 UTC',
    },
    {
      id: 'c8c1ca07-1036-4370-9c08-ecde1941c182',
      name: 'Distribute full cost',
      description: 'Distribute platform and unallocated costs',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 0,
      lastUpdated: 'Jan 30, 2025, 03:19 UTC',
    },
    {
      id: '048fa4f2-6410-4b7c-83e4-2794c9646c35',
      name: 'Effective cost demo',
      description: '',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 1,
      lastUpdated: 'Jan 30, 2025, 14:29 UTC',
    },
    {
      id: 'd407deb1-e791-4465-9600-31fc5bd99a2f',
      name: 'Go Operator',
      description: '',
      integration: 'OpenShift Container Platform',
      assignedIntegrations: 2,
      lastUpdated: 'Apr 5, 2024, 13:54 UTC',
    },
  ];

  const totalItems = 26;

  // Mock tags data
  const tags: TagItem[] = [
    { id: '1', name: '3.8', status: 'disabled', integration: 'Amazon Web Services' },
    { id: '2', name: 'a', status: 'enabled', integration: 'OpenShift' },
    { id: '3', name: 'A', status: 'disabled', integration: 'Amazon Web Services' },
    { id: '4', name: 'aa', status: 'disabled', integration: 'Amazon Web Services' },
    { id: '5', name: 'ability', status: 'enabled', integration: 'OpenShift' },
    { id: '6', name: 'able', status: 'enabled', integration: 'OpenShift' },
    { id: '7', name: 'about', status: 'enabled', integration: 'OpenShift' },
    { id: '8', name: 'above', status: 'disabled', integration: 'OpenShift' },
    { id: '9', name: 'accept', status: 'disabled', integration: 'OpenShift' },
    { id: '10', name: 'Access', status: 'enabled', integration: 'Amazon Web Services' },
  ];
  const totalTags = 1973;

  // Mock categories data
  const categories: CategoryItem[] = [
    { id: '1', name: 'Charge type', status: 'enabled' },
    { id: '2', name: 'CostCenter', status: 'enabled' },
    { id: '3', name: 'cost_env', status: 'enabled' },
    { id: '4', name: 'name', status: 'enabled' },
    { id: '5', name: 'Organization', status: 'enabled' },
    { id: '6', name: 'OUs', status: 'enabled' },
    { id: '7', name: 'qe_source', status: 'enabled' },
  ];
  const totalCategories = 7;

  // Mock platform projects data
  const projects: PlatformProject[] = [
    { id: '1', name: 'america', isDefault: false, group: 'Platform', clusters: ['demolab'] },
    { id: '2', name: 'Berlin', isDefault: false, group: 'Platform', clusters: ['OCP-OnPrem01'] },
    { id: '3', name: 'Boston', isDefault: false, group: 'Platform', clusters: ['OCP-OnPrem01'] },
    { id: '4', name: 'Cary', isDefault: false, group: 'Platform', clusters: ['OCP-OnPrem01'] },
    { id: '5', name: 'catalog', isDefault: false, group: 'Platform', clusters: ['Openshift on AWS'] },
    { id: '6', name: 'europe', isDefault: false, group: 'Platform', clusters: ['demolab'] },
    { id: '7', name: 'Garner', isDefault: false, group: 'Platform', clusters: ['OCP-OnPrem01'] },
    { id: '8', name: 'kube-system', isDefault: true, group: 'Platform', clusters: ['OCP-OnPrem01', 'OpenShift on GCP - Nise Populator'] },
    { id: '9', name: 'nvidia-gpu-operator', isDefault: false, group: 'Platform', clusters: ['demolab'] },
    { id: '10', name: 'openshift', isDefault: true, group: 'Platform', clusters: ['OCP-OnPrem01', 'OpenShift on GCP - Nise Populator'] },
  ];
  const totalProjects = 137;

  // Mock map tags data
  interface TagMapping {
    id: string;
    parentTag: string;
    integration: string;
    childTags: Array<{ name: string; integration: string }>;
  }

  const tagMappings: TagMapping[] = [
    {
      id: '1',
      parentTag: 'able',
      integration: 'OpenShift',
      childTags: [{ name: 'ability', integration: 'OpenShift' }],
    },
    {
      id: '2',
      parentTag: 'Access',
      integration: 'Amazon Web Services',
      childTags: [
        { name: 'AccessTag', integration: 'Amazon Web Services' },
        { name: 'anewtag', integration: 'Amazon Web Services' },
      ],
    },
    {
      id: '3',
      parentTag: 'another',
      integration: 'Amazon Web Services',
      childTags: [
        { name: 'Another', integration: 'Amazon Web Services' },
        { name: 'another_tag', integration: 'Amazon Web Services' },
        { name: 'AnotherTag', integration: 'Amazon Web Services' },
      ],
    },
    {
      id: '4',
      parentTag: 'ansible-workshops',
      integration: 'Amazon Web Services',
      childTags: [
        { name: 'ansible-test', integration: 'Amazon Web Services' },
        { name: 'AnsibleTest', integration: 'Amazon Web Services' },
        { name: 'AnsibleUser', integration: 'Amazon Web Services' },
        { name: 'Ansible_Workshops', integration: 'Amazon Web Services' },
      ],
    },
    {
      id: '5',
      parentTag: 'api',
      integration: 'OpenShift',
      childTags: [
        { name: 'aws-account-operator', integration: 'Amazon Web Services' },
        { name: 'AWSEndpointService', integration: 'Amazon Web Services' },
        { name: 'aws_instance_count', integration: 'Amazon Web Services' },
        { name: 'Backup-type', integration: 'Amazon Web Services' },
      ],
    },
    {
      id: '6',
      parentTag: 'app',
      integration: 'Microsoft Azure',
      childTags: [
        { name: 'app', integration: 'Amazon Web Services' },
        { name: 'app', integration: 'OpenShift' },
        { name: 'app', integration: 'Google Cloud' },
        { name: 'App', integration: 'Amazon Web Services' },
        { name: 'appcode', integration: 'Amazon Web Services' },
        { name: 'app-code', integration: 'Amazon Web Services' },
        { name: 'Appcode', integration: 'Amazon Web Services' },
        { name: 'Appcode ', integration: 'Amazon Web Services' },
      ],
    },
    {
      id: '7',
      parentTag: 'application',
      integration: 'OpenShift',
      childTags: [
        { name: 'app-code', integration: 'Microsoft Azure' },
        { name: 'AppCode', integration: 'Amazon Web Services' },
        { name: 'App Code', integration: 'Amazon Web Services' },
        { name: 'Application', integration: 'Amazon Web Services' },
        { name: 'AppName', integration: 'Amazon Web Services' },
      ],
    },
    {
      id: '8',
      parentTag: 'env',
      integration: 'Google Cloud',
      childTags: [
        { name: 'environment', integration: 'Amazon Web Services' },
        { name: 'environment', integration: 'OpenShift' },
        { name: 'environment', integration: 'Microsoft Azure' },
        { name: 'environment', integration: 'Google Cloud' },
        { name: 'Environment', integration: 'Amazon Web Services' },
      ],
    },
  ];
  const totalMapTags = 8;

  const handleTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveTab(tabIndex);
  };

  const handleTagsSubTabClick = (
    event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setTagsSubTab(tabIndex);
  };

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

  const getTagsSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: tagsSortIndex,
      direction: tagsSortDirection,
    },
    onSort: (_event, index, direction) => {
      setTagsSortIndex(index);
      setTagsSortDirection(direction);
    },
    columnIndex,
  });

  const getCategoriesSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: categoriesSortIndex,
      direction: categoriesSortDirection,
    },
    onSort: (_event, index, direction) => {
      setCategoriesSortIndex(index);
      setCategoriesSortDirection(direction);
    },
    columnIndex,
  });

  const getProjectsSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: projectsSortIndex,
      direction: projectsSortDirection,
    },
    onSort: (_event, index, direction) => {
      setProjectsSortIndex(index);
      setProjectsSortDirection(direction);
    },
    columnIndex,
  });

  const getMapTagsSortParams = (columnIndex: number): ThProps['sort'] => ({
    sortBy: {
      index: mapTagsSortIndex,
      direction: mapTagsSortDirection,
    },
    onSort: (_event, index, direction) => {
      setMapTagsSortIndex(index);
      setMapTagsSortDirection(direction);
    },
    columnIndex,
  });

  const toggleMapTagExpansion = (tagId: string) => {
    setExpandedMapTags((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
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
              <BreadcrumbItem to="/cost-management/settings" isActive>Settings</BreadcrumbItem>
            </Breadcrumb>
          </FlexItem>
          <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
            {/* Placeholder for favorite icon */}
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Header Section */}
      <PageSection style={{ paddingBottom: 0 }}>
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
          <FlexItem>
            <Title headingLevel="h1" size="2xl">
              Cost management settings
            </Title>
          </FlexItem>
          <FlexItem>
            <Tabs activeKey={activeTab} onSelect={handleTabClick}>
              <Tab eventKey={0} title="Cost models" id="cost-models-tab" />
              <Tab eventKey={1} title="Currency and calculations" id="currency-tab" />
              <Tab eventKey={2} title="Tags and labels" id="tags-tab" />
              <Tab eventKey={3} title="Cost categories" id="categories-tab" />
              <Tab eventKey={4} title="Platform projects" id="projects-tab" />
            </Tabs>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Main Content */}
      <PageSection>
        <TabContent eventKey={0} id="cost-models-tab-content" activeKey={activeTab} hidden={activeTab !== 0}>
          <Card>
            <CardBody>
              <p>
                Cost models can help you analyze and predict future costs. Associate a price to metrics provided by your integrations to calculate your charges for resource usage.{' '}
                <a href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html-single/using_cost_models" rel="noreferrer" target="_blank">
                  Learn more
                </a>
              </p>

              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                {/* Toolbar */}
                <Toolbar id="cost-models-toolbar">
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
                                Name
                              </MenuToggle>
                            )}
                          >
                            <SelectList>
                              <SelectOption value="Name">Name</SelectOption>
                              <SelectOption value="Description">Description</SelectOption>
                            </SelectList>
                          </Select>
                        </ToolbarItem>
                        <ToolbarItem>
                          <InputGroup id="cost-model-filter-input">
                            <InputGroupItem isFill>
                              <TextInputGroup>
                                <TextInputGroupMain
                                  icon={<SearchIcon />}
                                  value={searchValue}
                                  onChange={(_event, value) => setSearchValue(value)}
                                  placeholder="Filter by name"
                                  aria-label="Filter by name"
                                />
                                {searchValue && (
                                  <TextInputGroupUtilities>
                                    <Button variant="plain" onClick={() => setSearchValue('')} aria-label="Clear filter">
                                      <MinusCircleIcon />
                                    </Button>
                                  </TextInputGroupUtilities>
                                )}
                              </TextInputGroup>
                            </InputGroupItem>
                            <InputGroupItem>
                              <Button variant="control" aria-label="Search" type="submit">
                                <ArrowRightIcon />
                              </Button>
                            </InputGroupItem>
                          </InputGroup>
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarToggleGroup>

                    <ToolbarGroup>
                      <ToolbarItem>
                        <Button variant="primary" onClick={() => setIsWizardOpen(true)}>Create cost model</Button>
                      </ToolbarItem>
                    </ToolbarGroup>

                    <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={totalItems}
                        perPage={perPage}
                        page={page}
                        onSetPage={(_evt, newPage) => setPage(newPage)}
                        widgetId="options-menu-top-pagination"
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
                <Table aria-label="Cost models table" variant="compact" gridBreakPoint="grid-2xl">
                  <Thead>
                    <Tr>
                      <Th sort={getSortParams(0)}>Name</Th>
                      <Th>Description</Th>
                      <Th sort={getSortParams(2)}>Integration</Th>
                      <Th>Assigned integrations</Th>
                      <Th sort={getSortParams(4)}>Last updated</Th>
                      <Th />
                      <Th aria-label="Cost model actions" />
                    </Tr>
                  </Thead>
                  <Tbody>
                    {costModels.map((model) => (
                      <Tr key={model.id}>
                        <Td dataLabel="Name">
                          <Link to={`/cost-management/settings/cost-model/${model.id}`}>
                            {model.name}
                          </Link>
                        </Td>
                        <Td dataLabel="Description">{model.description}</Td>
                        <Td dataLabel="Integration">{model.integration}</Td>
                        <Td dataLabel="Assigned integrations">{model.assignedIntegrations}</Td>
                        <Td dataLabel="Last updated">{model.lastUpdated}</Td>
                        <Td isActionCell>
                          <Button variant="plain" aria-label="Delete" size="sm">
                            <MinusCircleIcon />
                          </Button>
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
                    widgetId="options-menu-bottom-pagination"
                    onPerPageSelect={(_evt, newPerPage, newPage) => {
                      setPerPage(newPerPage);
                      setPage(newPage);
                    }}
                    variant={PaginationVariant.bottom}
                    isCompact={false}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </TabContent>

        <TabContent eventKey={1} id="currency-tab-content" activeKey={activeTab} hidden={activeTab !== 1}>
          <Card>
            <CardBody>
              <Title headingLevel="h2" size="md" style={{ paddingBottom: 'var(--pf-t--global--spacer--sm)' }}>
                Currency
              </Title>
              <p>Select the preferred currency view for your organization</p>

              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)', width: 'fit-content' }}>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  <Select
                    isOpen={currencyOpen}
                    onSelect={() => setCurrencyOpen(false)}
                    onOpenChange={(isOpen) => setCurrencyOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        onClick={() => setCurrencyOpen(!currencyOpen)}
                        isExpanded={currencyOpen}
                        style={{ width: '100%' }}
                      >
                        USD ($) - United States Dollar
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="USD">USD ($) - United States Dollar</SelectOption>
                    </SelectList>
                  </Select>
                </Flex>
              </div>

              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                <Title headingLevel="h2" size="md" style={{ paddingBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  Show cost as (Amazon Web Services only)
                </Title>
                <p>
                  Select the preferred way of calculating upfront costs of savings plans or subscription fees. This feature is available for Amazon Web Services cost only.
                </p>

                <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)', width: 'fit-content' }}>
                  <Flex alignItems={{ default: 'alignItemsCenter' }}>
                    <Select
                      isOpen={showCostAsOpen}
                      onSelect={() => setShowCostAsOpen(false)}
                      onOpenChange={(isOpen) => setShowCostAsOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setShowCostAsOpen(!showCostAsOpen)}
                          isExpanded={showCostAsOpen}
                          style={{ width: '100%' }}
                        >
                          Amortized
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        <SelectOption value="amortized">Amortized</SelectOption>
                        <SelectOption value="unblended">Unblended</SelectOption>
                      </SelectList>
                    </Select>
                  </Flex>
                </div>
              </div>
            </CardBody>
          </Card>
        </TabContent>

        <TabContent eventKey={2} id="tags-tab-content" activeKey={activeTab} hidden={activeTab !== 2}>
          <Card>
            <CardTitle>
              <Tabs activeKey={tagsSubTab} onSelect={handleTagsSubTabClick}>
                <Tab eventKey={0} title="Enable tags and labels" id="enable-tags-tab" />
                <Tab eventKey={1} title="Map tags and labels" id="map-tags-tab" />
              </Tabs>
            </CardTitle>
            <CardBody>
              <TabContent eventKey={0} id="enable-tags-content" activeKey={tagsSubTab} hidden={tagsSubTab !== 0}>
                <p>
                  Enable your tags and labels to be used as tag keys for report grouping and filtering. Your account is limited to 200 active tags at a time. Changes will be reflected within 24 hours.{' '}
                  <a href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html/managing_cost_data_using_tagging/assembly-configuring-tags-and-labels-in-cost-management" rel="noreferrer" target="_blank">
                    Learn more
                  </a>
                </p>

                <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                  {/* Toolbar */}
                  <Toolbar id="tags-toolbar">
                    <ToolbarContent>
                      <ToolbarItem>
                        <Checkbox
                          id="tags-bulk-select"
                          aria-label="Select all items"
                          isChecked={selectAllTags}
                          onChange={(_event, checked) => setSelectAllTags(checked)}
                        />
                      </ToolbarItem>

                      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                        <ToolbarGroup variant="filter-group">
                          <ToolbarItem>
                            <Select
                              isOpen={tagsCategoryOpen}
                              onSelect={() => setTagsCategoryOpen(false)}
                              onOpenChange={(isOpen) => setTagsCategoryOpen(isOpen)}
                              toggle={(toggleRef) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  onClick={() => setTagsCategoryOpen(!tagsCategoryOpen)}
                                  isExpanded={tagsCategoryOpen}
                                  icon={<FilterIcon />}
                                >
                                  Name
                                </MenuToggle>
                              )}
                            >
                              <SelectList>
                                <SelectOption value="Name">Name</SelectOption>
                              </SelectList>
                            </Select>
                          </ToolbarItem>
                          <ToolbarItem>
                            <InputGroup id="tags-category-input-key">
                              <InputGroupItem isFill>
                                <TextInputGroup>
                                  <TextInputGroupMain
                                    icon={<SearchIcon />}
                                    value={tagsSearchValue}
                                    onChange={(_event, value) => setTagsSearchValue(value)}
                                    placeholder="Filter by name"
                                    aria-label="Input for name"
                                  />
                                </TextInputGroup>
                              </InputGroupItem>
                              <InputGroupItem>
                                <Button variant="control" aria-label="Search" type="submit">
                                  <ArrowRightIcon />
                                </Button>
                              </InputGroupItem>
                            </InputGroup>
                          </ToolbarItem>
                        </ToolbarGroup>
                      </ToolbarToggleGroup>

                      <ToolbarGroup>
                        <ToolbarItem>
                          <Button variant="primary" isDisabled>Enable tags</Button>
                        </ToolbarItem>
                        <ToolbarItem style={{ marginLeft: 'var(--pf-t--global--spacer--md)' }}>
                          <Button variant="secondary" isDisabled>Disable tags</Button>
                        </ToolbarItem>
                      </ToolbarGroup>

                      <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                        <Pagination
                          itemCount={totalTags}
                          perPage={tagsPerPage}
                          page={tagsPage}
                          onSetPage={(_evt, newPage) => setTagsPage(newPage)}
                          widgetId="tags-pagination-top"
                          onPerPageSelect={(_evt, newPerPage, newPage) => {
                            setTagsPerPage(newPerPage);
                            setTagsPage(newPage);
                          }}
                          isCompact
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>

                  {/* Table */}
                  <Table aria-label="Details table" variant="compact" gridBreakPoint="grid-2xl">
                    <Thead>
                      <Tr>
                        <Th />
                        <Th sort={getTagsSortParams(1)}>Name</Th>
                        <Th sort={getTagsSortParams(2)}>Status</Th>
                        <Th sort={getTagsSortParams(3)}>Integration</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {tags.map((tag, index) => (
                        <Tr key={tag.id}>
                          <Td
                            select={{
                              rowIndex: index,
                              onSelect: () => {},
                              isSelected: false,
                            }}
                          />
                          <Td dataLabel="Name" modifier="nowrap">{tag.name}</Td>
                          <Td dataLabel="Status" modifier="nowrap">
                            <Label color={tag.status === 'enabled' ? 'green' : undefined}>
                              {tag.status === 'enabled' ? 'Enabled' : 'Disabled'}
                            </Label>
                          </Td>
                          <Td dataLabel="Integration" modifier="nowrap">{tag.integration}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  {/* Bottom Pagination */}
                  <div style={{ paddingBottom: '1rem', paddingTop: '0.5rem' }}>
                    <Pagination
                      itemCount={totalTags}
                      perPage={tagsPerPage}
                      page={tagsPage}
                      onSetPage={(_evt, newPage) => setTagsPage(newPage)}
                      widgetId="tags-pagination-bottom"
                      onPerPageSelect={(_evt, newPerPage, newPage) => {
                        setTagsPerPage(newPerPage);
                        setTagsPage(newPage);
                      }}
                      variant={PaginationVariant.bottom}
                      isCompact={false}
                    />
                  </div>
                </div>
              </TabContent>

              <TabContent eventKey={1} id="map-tags-content" activeKey={tagsSubTab} hidden={tagsSubTab !== 1}>
                <div>
                  Combine multiple tags across your cloud integrations to group and filter similar tags with one tag key. <b>You must enable tags to use tag mapping.</b> Changes will be reflected within 24 hours.{' '}
                  <a href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html/managing_cost_data_using_tagging" rel="noreferrer" target="_blank">
                    Learn more
                  </a>
                </div>

                <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                  {/* Toolbar */}
                  <Toolbar id="map-tags-toolbar">
                    <ToolbarContent>
                      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                        <ToolbarGroup variant="filter-group">
                          <ToolbarItem>
                            <Select
                              isOpen={mapTagsCategoryOpen}
                              onSelect={() => setMapTagsCategoryOpen(false)}
                              onOpenChange={(isOpen) => setMapTagsCategoryOpen(isOpen)}
                              toggle={(toggleRef) => (
                                <MenuToggle
                                  ref={toggleRef}
                                  onClick={() => setMapTagsCategoryOpen(!mapTagsCategoryOpen)}
                                  isExpanded={mapTagsCategoryOpen}
                                  icon={<FilterIcon />}
                                >
                                  Parent tag Key
                                </MenuToggle>
                              )}
                            >
                              <SelectList>
                                <SelectOption value="Parent tag Key">Parent tag Key</SelectOption>
                              </SelectList>
                            </Select>
                          </ToolbarItem>
                          <ToolbarItem>
                            <InputGroup id="category-input-parent">
                              <InputGroupItem isFill>
                                <TextInputGroup>
                                  <TextInputGroupMain
                                    icon={<SearchIcon />}
                                    value={mapTagsSearchValue}
                                    onChange={(_event, value) => setMapTagsSearchValue(value)}
                                    placeholder="Filter by parent tag key"
                                    aria-label="Input for parent tag key"
                                  />
                                </TextInputGroup>
                              </InputGroupItem>
                              <InputGroupItem>
                                <Button variant="control" aria-label="Search" type="submit">
                                  <ArrowRightIcon />
                                </Button>
                              </InputGroupItem>
                            </InputGroup>
                          </ToolbarItem>
                        </ToolbarGroup>
                      </ToolbarToggleGroup>

                      <ToolbarGroup>
                        <ToolbarItem>
                          <Button variant="primary">Create tag mapping</Button>
                        </ToolbarItem>
                      </ToolbarGroup>

                      <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                        <Pagination
                          itemCount={totalMapTags}
                          perPage={mapTagsPerPage}
                          page={mapTagsPage}
                          onSetPage={(_evt, newPage) => setMapTagsPage(newPage)}
                          widgetId="pagination-top-pagination"
                          onPerPageSelect={(_evt, newPerPage, newPage) => {
                            setMapTagsPerPage(newPerPage);
                            setMapTagsPage(newPage);
                          }}
                          isCompact
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>

                  {/* Table */}
                  <Table aria-label="Details table" variant="compact" gridBreakPoint="grid-2xl" className="tableOverride">
                    <Thead>
                      <Tr>
                        <Th />
                        <Th sort={getMapTagsSortParams(1)}>Tag keys</Th>
                        <Th sort={getMapTagsSortParams(2)}>Integration</Th>
                        <Th />
                      </Tr>
                    </Thead>
                    {tagMappings.map((mapping, index) => {
                      const isExpanded = expandedMapTags.has(mapping.id);
                      return (
                        <Tbody key={mapping.id} isExpanded={isExpanded}>
                          <Tr>
                            <Td
                              expand={{
                                rowIndex: index,
                                isExpanded,
                                onToggle: () => toggleMapTagExpansion(mapping.id),
                              }}
                            />
                            <Td dataLabel="Tag keys" modifier="nowrap">
                              {mapping.parentTag}
                            </Td>
                            <Td dataLabel="Integration" modifier="nowrap">
                              {mapping.integration}
                            </Td>
                            <Td isActionCell>
                              <MenuToggle variant="plain" aria-label="More options">
                                <EllipsisVIcon />
                              </MenuToggle>
                            </Td>
                          </Tr>
                          {mapping.childTags.map((childTag, childIndex) => (
                            <Tr key={`${mapping.id}-child-${childIndex}`} isExpanded={isExpanded}>
                              <Td />
                              <Td dataLabel="Tag keys" modifier="nowrap" style={{ paddingLeft: '1rem' }}>
                                {childTag.name}
                              </Td>
                              <Td dataLabel="Integration" modifier="nowrap" style={{ paddingLeft: '1rem' }}>
                                {childTag.integration}
                              </Td>
                              <Td isActionCell style={{ paddingRight: '3rem' }}>
                                <Button variant="plain" aria-label="Remove child tag" size="sm">
                                  <MinusCircleIcon />
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      );
                    })}
                  </Table>

                  {/* Bottom Pagination */}
                  <div style={{ paddingBottom: '1rem', paddingTop: '0.5rem' }}>
                    <Pagination
                      itemCount={totalMapTags}
                      perPage={mapTagsPerPage}
                      page={mapTagsPage}
                      onSetPage={(_evt, newPage) => setMapTagsPage(newPage)}
                      widgetId="pagination-bottom-bottom-pagination"
                      onPerPageSelect={(_evt, newPerPage, newPage) => {
                        setMapTagsPerPage(newPerPage);
                        setMapTagsPage(newPage);
                      }}
                      variant={PaginationVariant.bottom}
                      isCompact={false}
                    />
                  </div>
                </div>
              </TabContent>
            </CardBody>
          </Card>
        </TabContent>

        <TabContent eventKey={3} id="categories-tab-content" activeKey={activeTab} hidden={activeTab !== 3}>
          <Card>
            <CardBody>
              <p>
                Enable your AWS cost categories to be used for report grouping and filtering. Changes will be reflected within 24 hours.{' '}
                <a href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html/managing_cost_data_using_tagging/assembly-configuring-tags-and-labels-in-cost-management#configuring-categories_configuring-tags-int" rel="noreferrer" target="_blank">
                  Learn more
                </a>
              </p>

              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                {/* Toolbar */}
                <Toolbar id="categories-toolbar">
                  <ToolbarContent>
                    <ToolbarItem>
                      <Checkbox
                        id="categories-bulk-select"
                        aria-label="Select all items"
                        isChecked={selectAllCategories}
                        onChange={(_event, checked) => setSelectAllCategories(checked)}
                      />
                    </ToolbarItem>

                    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                      <ToolbarGroup variant="filter-group">
                        <ToolbarItem>
                          <Select
                            isOpen={categoriesCategoryOpen}
                            onSelect={() => setCategoriesCategoryOpen(false)}
                            onOpenChange={(isOpen) => setCategoriesCategoryOpen(isOpen)}
                            toggle={(toggleRef) => (
                              <MenuToggle
                                ref={toggleRef}
                                onClick={() => setCategoriesCategoryOpen(!categoriesCategoryOpen)}
                                isExpanded={categoriesCategoryOpen}
                                icon={<FilterIcon />}
                              >
                                Name
                              </MenuToggle>
                            )}
                          >
                            <SelectList>
                              <SelectOption value="Name">Name</SelectOption>
                            </SelectList>
                          </Select>
                        </ToolbarItem>
                        <ToolbarItem>
                          <InputGroup id="categories-input-key">
                            <InputGroupItem isFill>
                              <TextInputGroup>
                                <TextInputGroupMain
                                  icon={<SearchIcon />}
                                  value={categoriesSearchValue}
                                  onChange={(_event, value) => setCategoriesSearchValue(value)}
                                  placeholder="Filter by name"
                                  aria-label="Input for name"
                                />
                              </TextInputGroup>
                            </InputGroupItem>
                            <InputGroupItem>
                              <Button variant="control" aria-label="Search" type="submit">
                                <ArrowRightIcon />
                              </Button>
                            </InputGroupItem>
                          </InputGroup>
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarToggleGroup>

                    <ToolbarGroup>
                      <ToolbarItem>
                        <Button variant="primary" isDisabled>Enable categories</Button>
                      </ToolbarItem>
                      <ToolbarItem style={{ marginLeft: 'var(--pf-t--global--spacer--md)' }}>
                        <Button variant="secondary" isDisabled>Disable categories</Button>
                      </ToolbarItem>
                    </ToolbarGroup>

                    <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={totalCategories}
                        perPage={categoriesPerPage}
                        page={categoriesPage}
                        onSetPage={(_evt, newPage) => setCategoriesPage(newPage)}
                        widgetId="categories-pagination-top"
                        onPerPageSelect={(_evt, newPerPage, newPage) => {
                          setCategoriesPerPage(newPerPage);
                          setCategoriesPage(newPage);
                        }}
                        isCompact
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>

                {/* Table */}
                <Table aria-label="Details table" variant="compact" gridBreakPoint="grid-2xl">
                  <Thead>
                    <Tr>
                      <Th />
                      <Th sort={getCategoriesSortParams(1)}>Name</Th>
                      <Th sort={getCategoriesSortParams(2)}>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {categories.map((category, index) => (
                      <Tr key={category.id}>
                        <Td
                          select={{
                            rowIndex: index,
                            onSelect: () => {},
                            isSelected: false,
                          }}
                        />
                        <Td dataLabel="Name" modifier="nowrap">{category.name}</Td>
                        <Td dataLabel="Status" modifier="nowrap">
                          <Label color={category.status === 'enabled' ? 'green' : undefined}>
                            {category.status === 'enabled' ? 'Enabled' : 'Disabled'}
                          </Label>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Bottom Pagination */}
                <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                  <Pagination
                    itemCount={totalCategories}
                    perPage={categoriesPerPage}
                    page={categoriesPage}
                    onSetPage={(_evt, newPage) => setCategoriesPage(newPage)}
                    widgetId="categories-pagination-bottom"
                    onPerPageSelect={(_evt, newPerPage, newPage) => {
                      setCategoriesPerPage(newPerPage);
                      setCategoriesPage(newPage);
                    }}
                    variant={PaginationVariant.bottom}
                    isCompact={false}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </TabContent>

        <TabContent eventKey={4} id="projects-tab-content" activeKey={activeTab} hidden={activeTab !== 4}>
          <Card>
            <CardBody>
              <p>
                Associate additional projects with OpenShift Platform project costs to charge for utilization of resources. Changes will be reflected in this month's cost calculations within 24 hrs.{' '}
                <a href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html/using_cost_models/assembly-using-cost-models#adding-openshift-projects" rel="noreferrer" target="_blank">
                  Learn more
                </a>
              </p>

              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                {/* Toolbar */}
                <Toolbar id="projects-toolbar">
                  <ToolbarContent>
                    <ToolbarItem>
                      <Checkbox
                        id="projects-bulk-select"
                        aria-label="Select all items"
                        isChecked={selectAllProjects}
                        onChange={(_event, checked) => setSelectAllProjects(checked)}
                      />
                    </ToolbarItem>

                    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                      <ToolbarGroup variant="filter-group">
                        <ToolbarItem>
                          <Select
                            isOpen={projectsCategoryOpen}
                            onSelect={() => setProjectsCategoryOpen(false)}
                            onOpenChange={(isOpen) => setProjectsCategoryOpen(isOpen)}
                            toggle={(toggleRef) => (
                              <MenuToggle
                                ref={toggleRef}
                                onClick={() => setProjectsCategoryOpen(!projectsCategoryOpen)}
                                isExpanded={projectsCategoryOpen}
                                icon={<FilterIcon />}
                              >
                                Name
                              </MenuToggle>
                            )}
                          >
                            <SelectList>
                              <SelectOption value="Name">Name</SelectOption>
                            </SelectList>
                          </Select>
                        </ToolbarItem>
                        <ToolbarItem>
                          <TextInputGroup>
                            <TextInputGroupMain
                              icon={<SearchIcon />}
                              value={projectsSearchValue}
                              onChange={(_event, value) => setProjectsSearchValue(value)}
                              placeholder="Filter by name"
                              aria-label="Input for name"
                            />
                          </TextInputGroup>
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarToggleGroup>

                    <ToolbarGroup>
                      <ToolbarItem>
                        <Button variant="primary" isDisabled>Add projects</Button>
                      </ToolbarItem>
                      <ToolbarItem style={{ marginLeft: 'var(--pf-t--global--spacer--md)' }}>
                        <Button variant="secondary" isDisabled>Remove projects</Button>
                      </ToolbarItem>
                    </ToolbarGroup>

                    <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                      <Pagination
                        itemCount={totalProjects}
                        perPage={projectsPerPage}
                        page={projectsPage}
                        onSetPage={(_evt, newPage) => setProjectsPage(newPage)}
                        widgetId="projects-pagination-top"
                        onPerPageSelect={(_evt, newPerPage, newPage) => {
                          setProjectsPerPage(newPerPage);
                          setProjectsPage(newPage);
                        }}
                        isCompact
                      />
                    </ToolbarItem>
                  </ToolbarContent>
                </Toolbar>

                {/* Table */}
                <Table aria-label="Details table" variant="compact" gridBreakPoint="grid-2xl">
                  <Thead>
                    <Tr>
                      <Th />
                      <Th sort={getProjectsSortParams(1)}>Name</Th>
                      <Th />
                      <Th sort={getProjectsSortParams(3)}>Group</Th>
                      <Th>Clusters</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {projects.map((project, index) => (
                      <Tr key={project.id}>
                        <Td
                          select={{
                            rowIndex: index,
                            onSelect: () => {},
                            isSelected: false,
                            isDisabled: project.isDefault,
                          }}
                        />
                        <Td dataLabel="Name" modifier="nowrap">{project.name}</Td>
                        <Td modifier="nowrap">
                          {project.isDefault && (
                            <Label color="green">Default</Label>
                          )}
                        </Td>
                        <Td dataLabel="Group" modifier="nowrap">
                          <Label color="green">Platform</Label>
                        </Td>
                        <Td dataLabel="Clusters" modifier="nowrap">
                          <div style={{ marginRight: '4rem', marginTop: '0.5rem' }}>
                            {project.clusters.length === 1 ? (
                              <span>{project.clusters[0]}</span>
                            ) : project.clusters.length === 2 ? (
                              <>
                                <span>{project.clusters[0]}</span>
                                <span>, {project.clusters[1]}</span>
                              </>
                            ) : (
                              <>
                                <span>{project.clusters[0]}</span>
                                <span>, {project.clusters[1]}</span>
                                <Link to="#">, {project.clusters.length - 2} more...</Link>
                              </>
                            )}
                          </div>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                {/* Bottom Pagination */}
                <div style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
                  <Pagination
                    itemCount={totalProjects}
                    perPage={projectsPerPage}
                    page={projectsPage}
                    onSetPage={(_evt, newPage) => setProjectsPage(newPage)}
                    widgetId="projects-pagination-bottom"
                    onPerPageSelect={(_evt, newPerPage, newPage) => {
                      setProjectsPerPage(newPerPage);
                      setProjectsPage(newPage);
                    }}
                    variant={PaginationVariant.bottom}
                    isCompact={false}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </TabContent>
      </PageSection>

      {/* Create Cost Model Wizard */}
      <Modal
        variant={ModalVariant.large}
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        hasNoBodyWrapper
        aria-labelledby="create-cost-model-wizard-title"
      >
        <Wizard
          title="Create a cost model"
          description="A cost model allows you to associate a price to metrics provided by your integrations to charge for utilization of resources."
          onClose={() => setIsWizardOpen(false)}
        >
          <WizardStep
            name="Enter information"
            id="general-info-step"
          >
            <Stack hasGutter>
              <StackItem>
                <Title headingLevel="h2" size="xl" style={{ display: 'inline-block', marginRight: '1em' }}>
                  Enter general information
                </Title>
                <a
                  href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html-single/using_cost_models/index#assembly-setting-up-cost-models"
                  rel="noreferrer"
                  target="_blank"
                >
                  Learn more
                </a>
              </StackItem>
              <StackItem>
                <Form style={{ width: '350px' }}>
                  <FormGroup label="Name" isRequired fieldId="name">
                    <TextInput
                      isRequired
                      type="text"
                      id="name"
                      name="name"
                      value={wizardName}
                      onChange={(_event, value) => setWizardName(value)}
                    />
                  </FormGroup>

                  <FormGroup label="Description" fieldId="description">
                    <TextArea
                      type="text"
                      id="description"
                      name="description"
                      value={wizardDescription}
                      onChange={(_event, value) => setWizardDescription(value)}
                      style={{
                        maxWidth: '450px',
                        minWidth: '350px',
                        minHeight: '75px',
                        maxHeight: '150px',
                      }}
                    />
                  </FormGroup>

                  <FormGroup label="Integration" isRequired fieldId="source-type-selector">
                    <Select
                      isOpen={wizardIntegrationOpen}
                      onSelect={(_event, value) => {
                        setWizardIntegration(value as string);
                        setWizardIntegrationOpen(false);
                      }}
                      onOpenChange={(isOpen) => setWizardIntegrationOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setWizardIntegrationOpen(!wizardIntegrationOpen)}
                          isExpanded={wizardIntegrationOpen}
                          style={{ width: '100%' }}
                          aria-label="Select integration"
                        >
                          {wizardIntegration || 'Select integration'}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        <SelectOption value="OpenShift Container Platform">OpenShift Container Platform</SelectOption>
                        <SelectOption value="Amazon Web Services">Amazon Web Services</SelectOption>
                        <SelectOption value="Microsoft Azure">Microsoft Azure</SelectOption>
                        <SelectOption value="Google Cloud Platform">Google Cloud Platform</SelectOption>
                      </SelectList>
                    </Select>
                  </FormGroup>

                  <FormGroup label="Currency" fieldId="currency-units-selector">
                    <Select
                      isOpen={wizardCurrencyOpen}
                      onSelect={() => setWizardCurrencyOpen(false)}
                      onOpenChange={(isOpen) => setWizardCurrencyOpen(isOpen)}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          onClick={() => setWizardCurrencyOpen(!wizardCurrencyOpen)}
                          isExpanded={wizardCurrencyOpen}
                          style={{ width: '100%' }}
                          aria-label="Select currency"
                        >
                          {wizardCurrency}
                        </MenuToggle>
                      )}
                    >
                      <SelectList>
                        <SelectOption value="USD ($) - United States Dollar">USD ($) - United States Dollar</SelectOption>
                      </SelectList>
                    </Select>
                  </FormGroup>
                </Form>
              </StackItem>
            </Stack>
          </WizardStep>

          {/* Step 2: Cost calculations - only for AWS/Azure/GCP */}
          {wizardIntegration === 'Amazon Web Services' && (
            <WizardStep
              name="Cost calculations"
              id="cost-calculations-step"
            >
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h2" size="xl" style={{ display: 'inline-block', marginRight: '1em' }}>
                    Cost calculations (optional)
                  </Title>
                  <a
                    href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html/using_cost_models/assembly-setting-up-cost-models#creating-an-AWS-Azure-cost-model_setting-up-cost-models"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Learn more
                  </a>
                </StackItem>

                <StackItem>
                  <Title headingLevel="h3" size="md">Markup or Discount</Title>
                  <Content>
                    <p>
                      Use markup/discount to manipulate how the raw costs are being calculated for your integrations. Note, costs calculated from price list rates will not be affected by this.
                    </p>
                  </Content>
                </StackItem>

                <StackItem>
                  <Flex style={{ marginTop: '6px' }}>
                    <Flex direction={{ default: 'column' }} alignSelf={{ default: 'alignSelfCenter' }}>
                      <div>
                        <Radio
                          name="discount"
                          id="markup"
                          isChecked={!wizardIsDiscount}
                          onChange={() => setWizardIsDiscount(false)}
                          label="Markup (+)"
                          style={{ marginBottom: '6px' }}
                        />
                        <Radio
                          name="discount"
                          id="discount"
                          isChecked={wizardIsDiscount}
                          onChange={() => setWizardIsDiscount(true)}
                          label="Discount (-)"
                        />
                      </div>
                    </Flex>

                    <Flex direction={{ default: 'column' }} alignSelf={{ default: 'alignSelfCenter' }}>
                      <Form style={{ marginLeft: '20px' }}>
                        <FormGroup>
                          <InputGroup>
                            <InputGroupItem isFill={false}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0 var(--pf-t--global--spacer--sm)',
                                  border: '1px solid var(--pf-t--global--border--color--default)',
                                  borderRight: '0',
                                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                  alignItems: 'center',
                                  height: '36px',
                                  lineHeight: '34px',
                                }}
                              >
                                {wizardIsDiscount ? 'Discount (-)' : 'Markup (+)'}
                              </span>
                            </InputGroupItem>
                            <InputGroupItem isFill>
                              <TextInput
                                type="text"
                                id="markup-input-box"
                                aria-label="Rate"
                                value={wizardMarkupRate}
                                onChange={(_event, value) => setWizardMarkupRate(value)}
                                placeholder="0"
                                style={{ borderLeft: '0', width: '175px' }}
                              />
                            </InputGroupItem>
                            <InputGroupItem isFill={false}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0 var(--pf-t--global--spacer--sm)',
                                  border: '1px solid var(--pf-t--global--border--color--default)',
                                  borderLeft: '0',
                                  backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
                                  alignItems: 'center',
                                  height: '36px',
                                  lineHeight: '34px',
                                }}
                              >
                                %
                              </span>
                            </InputGroupItem>
                          </InputGroup>
                        </FormGroup>
                      </Form>
                    </Flex>
                  </Flex>
                </StackItem>

                <StackItem style={{ marginLeft: '30px' }}>
                  <Content>
                    <h3>Examples</h3>
                  </Content>
                  <List>
                    <ListItem>
                      <span>A markup or discount rate of (+/-) 0% (the default) makes no adjustments to the base costs of your integrations.</span>
                    </ListItem>
                    <ListItem>
                      <span>A markup rate of (+) 100% doubles the base costs of your integrations.</span>
                    </ListItem>
                    <ListItem>
                      <span>A discount rate of (-) 100% reduces the base costs of your integrations to 0.</span>
                    </ListItem>
                    <ListItem>
                      <span>A discount rate of (-) 25% reduces the base costs of your integrations to 75% of the original value.</span>
                    </ListItem>
                  </List>
                </StackItem>
              </Stack>
            </WizardStep>
          )}

          {/* Step 3: Assign integrations - only for AWS/Azure/GCP */}
          {wizardIntegration === 'Amazon Web Services' && (
            <WizardStep
              name="Assign an integration to the cost model"
              id="assign-integrations-step"
            >
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h2" size="xl">Assign integrations to the cost model (optional)</Title>
                </StackItem>

                <StackItem>
                  <Content>
                    <p>
                      Select one or more integrations to this cost model. You can skip this step and assign the cost model to a integration at a later time. An integration will be unavailable for selection if a cost model is already assigned to it.
                    </p>
                  </Content>
                </StackItem>

                <StackItem>
                  <Content>
                    <h3>Select from the following Amazon Web Services integrations:</h3>
                  </Content>
                </StackItem>

                <StackItem>
                  <Toolbar id="assign-sources-toolbar">
                    <ToolbarContent>
                      <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                        <ToolbarItem>
                          <SearchInput
                            placeholder="Filter by name..."
                            value={wizardIntegrationSearchValue}
                            onChange={(_event, value) => setWizardIntegrationSearchValue(value)}
                            onClear={() => setWizardIntegrationSearchValue('')}
                          />
                        </ToolbarItem>
                      </ToolbarToggleGroup>
                      <ToolbarItem variant="pagination">
                        <Pagination
                          itemCount={awsIntegrations.length}
                          perPage={10}
                          page={1}
                          widgetId="assign-integrations-pagination-top"
                          isCompact
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>

                  <Table aria-label="Assign integrations to cost model table" variant="compact" gridBreakPoint="grid-md">
                    <Thead>
                      <Tr>
                        <Th />
                        <Th>Name</Th>
                        <Th>Cost model assigned</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {awsIntegrations.map((integration) => (
                        <Tr key={integration.id}>
                          <Td
                            select={{
                              rowIndex: 0,
                              onSelect: (_event, isSelecting) => {
                                setWizardSelectedIntegrations(
                                  isSelecting
                                    ? [...wizardSelectedIntegrations, integration.id]
                                    : wizardSelectedIntegrations.filter((id) => id !== integration.id)
                                );
                              },
                              isSelected: wizardSelectedIntegrations.includes(integration.id),
                              disable: integration.assignedCostModel !== '',
                            }}
                          />
                          <Td dataLabel="Name">{integration.name}</Td>
                          <Td dataLabel="Cost model assigned">{integration.assignedCostModel}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>

                  <Toolbar>
                    <ToolbarContent>
                      <ToolbarItem variant="pagination">
                        <Pagination
                          itemCount={awsIntegrations.length}
                          perPage={10}
                          page={1}
                          widgetId="assign-integrations-pagination-bottom"
                          variant={PaginationVariant.bottom}
                          style={{ paddingTop: '0.5rem' }}
                        />
                      </ToolbarItem>
                    </ToolbarContent>
                  </Toolbar>
                </StackItem>
              </Stack>
            </WizardStep>
          )}

          {/* Step 4: Review details - only for AWS/Azure/GCP */}
          {wizardIntegration === 'Amazon Web Services' && (
            <WizardStep
              name="Review details"
              id="review-step"
            >
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h2" size="xl">Review details</Title>
                </StackItem>

                <StackItem>
                  <Content>
                    <p>
                      Review and confirm your cost model configuration and assignments. Click <strong>Create</strong> to create the cost model, or <strong>Back</strong> to revise.
                    </p>
                  </Content>
                </StackItem>

                <StackItem>
                  <Content>
                    <dl>
                      <dt>Name</dt>
                      <dd>{wizardName}</dd>
                      <dt>Description</dt>
                      <dd>{wizardDescription || ''}</dd>
                      <dt>Currency</dt>
                      <dd>{wizardCurrency}</dd>
                      <dt>Markup/Discount</dt>
                      <dd>{wizardIsDiscount ? '-' : '+'}{wizardMarkupRate} %</dd>
                      <dt>Assign integrations</dt>
                      <dd>
                        {wizardSelectedIntegrations.length > 0
                          ? wizardSelectedIntegrations
                              .map((id) => awsIntegrations.find((i) => i.id === id)?.name)
                              .filter(Boolean)
                              .join(', ')
                          : ''}
                      </dd>
                    </dl>
                  </Content>
                </StackItem>
              </Stack>
            </WizardStep>
          )}
        </Wizard>
      </Modal>
    </>
  );
};

export { CostManagementSettings };

