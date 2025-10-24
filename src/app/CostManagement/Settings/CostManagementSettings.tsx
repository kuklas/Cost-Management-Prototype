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
  Popover,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import {
  FilterIcon,
  SearchIcon,
  ArrowRightIcon,
  MinusCircleIcon,
  EllipsisVIcon,
  TimesIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { dataService } from '@app/data/dataService';

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
  const [perspectiveOpen, setPerspectiveOpen] = React.useState(false);
  const [perspective, setPerspective] = React.useState<'calendar' | 'billing'>('calendar');
  const [bufferMode, setBufferMode] = React.useState<'default' | 'custom'>('default');
  const [customMode, setCustomMode] = React.useState<'all' | 'per-provider'>('all');
  const [allProvidersBefore, setAllProvidersBefore] = React.useState('3');
  const [allProvidersAfter, setAllProvidersAfter] = React.useState('3');
  const [providerBuffers, setProviderBuffers] = React.useState<{
    aws: { before: string; after: string };
    gcp: { before: string; after: string };
    azure: { before: string; after: string };
  }>({
    aws: { before: '3', after: '3' },
    gcp: { before: '3', after: '3' },
    azure: { before: '3', after: '3' },
  });

  // Load buffer configuration from localStorage on mount
  React.useEffect(() => {
    const savedConfig = localStorage.getItem('bufferConfiguration');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setBufferMode(config.bufferMode || 'default');
        setCustomMode(config.customMode || 'all');
        setAllProvidersBefore(config.allProvidersBefore || '3');
        setAllProvidersAfter(config.allProvidersAfter || '3');
        setProviderBuffers(config.providerBuffers || {
          aws: { before: '3', after: '3' },
          gcp: { before: '3', after: '3' },
          azure: { before: '3', after: '3' },
        });
      } catch (e) {
        console.error('Failed to load buffer configuration:', e);
      }
    }
  }, []);

  // Save buffer configuration to localStorage whenever it changes
  React.useEffect(() => {
    const config = {
      bufferMode,
      customMode,
      allProvidersBefore,
      allProvidersAfter,
      providerBuffers,
    };
    localStorage.setItem('bufferConfiguration', JSON.stringify(config));
  }, [bufferMode, customMode, allProvidersBefore, allProvidersAfter, providerBuffers]);

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

  // Get cost models from database
  const dbCostModels = dataService.getAllCostModels();
  
  // Count how many integrations use each cost model
  const getCostModelUsage = (modelId: string): number => {
    const clusters = dataService.getAllClusters();
    const awsAccounts = dataService.getAWSAccounts();
    const gcpAccounts = dataService.getGCPAccounts();
    const azureAccounts = dataService.getAzureAccounts();

    let count = 0;
    count += clusters.filter(c => c.costModelId === modelId).length;
    count += awsAccounts.filter(a => a.costModelId === modelId).length;
    count += gcpAccounts.filter(a => a.costModelId === modelId).length;
    count += azureAccounts.filter(a => a.costModelId === modelId).length;

    return count;
  };

  // Transform database cost models to UI format
  const costModels: CostModel[] = dbCostModels.map(model => ({
    id: model.id,
    name: model.name,
    description: model.description,
    integration: model.sourceType,
    assignedIntegrations: getCostModelUsage(model.id),
    lastUpdated: model.lastModified,
  }));

  const totalItems = costModels.length;

  // Get tags from database
  const dbTags = dataService.getAllTags();
  
  // Transform database tags to UI format - expand each tag with its values for pagination
  const tags: TagItem[] = dbTags.flatMap(tag => 
    tag.values.map((value, index) => ({
      id: `${tag.id}-${index}`,
      name: `${tag.key}:${value}`,
      status: (tag.enabled ? 'enabled' : 'disabled') as 'enabled' | 'disabled',
      integration: tag.integrations.join(', '),
    }))
  );
  const totalTags = tags.length;

  // Get cost categories from database
  const dbCategories = dataService.getAllCostCategories();
  
  // Transform database categories to UI format
  const categories: CategoryItem[] = dbCategories.map(category => ({
    id: category.id,
    name: category.name,
    status: (category.enabled ? 'enabled' : 'disabled') as 'enabled' | 'disabled',
  }));
  const totalCategories = categories.length;

  // Get platform projects from database
  const dbPlatformProjects = dataService.getAllPlatformProjects();
  const allClusters = dataService.getAllClusters();
  
  // Transform database platform projects to UI format
  // Show all clusters for platform projects (they apply to all)
  const projects: PlatformProject[] = dbPlatformProjects.map(project => ({
    id: project.id,
    name: project.name,
    isDefault: project.isPlatformOverhead,
    group: project.type === 'platform' ? 'Platform' : 'Unallocated',
    clusters: allClusters.map(c => c.displayName), // Platform projects apply to all clusters
  }));
  const totalProjects = projects.length;

  // Tag mappings data
  interface TagMapping {
    id: string;
    parentTag: string;
    integration: string;
    childTags: Array<{ name: string; integration: string }>;
  }

  // Get tag mappings from database
  const dbTagMappings = dataService.getAllTagMappings();
  
  // Transform database tag mappings to UI format
  const tagMappings: TagMapping[] = dbTagMappings.map(mapping => ({
    id: mapping.id,
    parentTag: mapping.parentKey,
    integration: 'Multi-cloud', // Mappings apply across providers
    childTags: mapping.childKeys.map(child => ({
      name: child.key,
      integration: child.source,
    })),
  }));
  const totalMapTags = tagMappings.length;

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

              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                <Title headingLevel="h2" size="md" style={{ paddingBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  Period type configuration
                </Title>
                <p>
                  Configure how cross-over costs are calculated between calendar months and billing periods for cloud providers (AWS, Google Cloud, Azure).
                </p>

                <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)', width: 'fit-content' }}>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
                    {/* Default Period Type Selector */}
                    <FlexItem>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem style={{ minWidth: '150px' }}>
                          <strong>Default period type</strong>
                        </FlexItem>
                        <FlexItem>
                          <Select
                            isOpen={perspectiveOpen}
                            onSelect={(_event, value) => {
                              setPerspective(value as 'calendar' | 'billing');
                              setPerspectiveOpen(false);
                            }}
                            onOpenChange={(isOpen) => setPerspectiveOpen(isOpen)}
                            selected={perspective}
                            toggle={(toggleRef) => (
                              <MenuToggle
                                ref={toggleRef}
                                onClick={() => setPerspectiveOpen(!perspectiveOpen)}
                                isExpanded={perspectiveOpen}
                                style={{ width: '250px' }}
                              >
                                {perspective === 'calendar' ? 'Calendar' : 'Billing'}
                              </MenuToggle>
                            )}
                          >
                            <SelectList>
                              <SelectOption value="calendar" description="Standard monthly periods (1st to last day of month)">
                                Calendar
                              </SelectOption>
                              <SelectOption value="billing" description="Includes buffer zones to match cloud provider invoices">
                                Billing
                              </SelectOption>
                            </SelectList>
                          </Select>
                        </FlexItem>
                        <FlexItem>
                          <Popover
                            aria-label="Period type info"
                            headerContent={<div>Calendar vs Billing period type</div>}
                            bodyContent={
                              <div>
                                <p><strong>Calendar:</strong> Standard monthly periods (1st to last day of month). Shows costs when services were used.</p>
                                <p style={{ marginTop: '8px' }}><strong>Billing:</strong> Includes buffer zones to account for cloud provider billing cycles where usage near month boundaries may appear on different invoices.</p>
                              </div>
                            }
                          >
                            <Button variant="plain" aria-label="More info">
                              <OutlinedQuestionCircleIcon />
                            </Button>
                          </Popover>
                        </FlexItem>
                      </Flex>
                    </FlexItem>

                  </Flex>
                </div>
              </div>

              <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                <Title headingLevel="h2" size="md" style={{ paddingBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  Billing cross over period
                </Title>
                <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
                  <FormGroup fieldId="buffer-mode">
                    <Stack hasGutter>
                      <StackItem>
                        <Radio
                          id="buffer-default"
                          name="buffer-mode"
                          label="Default"
                          description="Use recommended 3-day buffer period for all cloud providers (3 days before month end, 3 days after month start)"
                          isChecked={bufferMode === 'default'}
                          onChange={() => setBufferMode('default')}
                        />
                      </StackItem>
                      <StackItem>
                        <Radio
                          id="buffer-custom"
                          name="buffer-mode"
                          label="Custom"
                          description="Configure custom buffer period per cloud provider"
                          isChecked={bufferMode === 'custom'}
                          onChange={() => setBufferMode('custom')}
                        />
                      </StackItem>
                    </Stack>
                  </FormGroup>

                  {bufferMode === 'custom' && (
                    <div style={{ marginTop: 'var(--pf-t--global--spacer--md)', marginLeft: 'var(--pf-t--global--spacer--lg)' }}>
                      <Stack hasGutter>
                        {/* Option 1: Apply same to all */}
                        <StackItem>
                          <Radio
                            id="custom-all"
                            name="custom-mode"
                            label="Apply the same to all"
                            description="Use the same custom buffer period for all cloud providers"
                            isChecked={customMode === 'all'}
                            onChange={() => setCustomMode('all')}
                          />
                          {customMode === 'all' && (
                          <div style={{ marginLeft: 'var(--pf-t--global--spacer--lg)' }}>
                            <Stack hasGutter>
                              <StackItem>
                                <FormGroup label="Days before month end" fieldId="all-buffer-before">
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                    <FlexItem>
                                      <TextInput
                                        type="number"
                                        id="all-buffer-before"
                                        value={allProvidersBefore}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setAllProvidersBefore(value);
                                          } else if (value === '') {
                                            setAllProvidersBefore('0');
                                          }
                                        }}
                                        style={{ width: '100px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FlexItem>
                                    <FlexItem>
                                      <span style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        (0-7 days)
                                      </span>
                                    </FlexItem>
                                  </Flex>
                                </FormGroup>
                              </StackItem>

                              <StackItem>
                                <FormGroup label="Days after month start" fieldId="all-buffer-after">
                                  <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                                    <FlexItem>
                                      <TextInput
                                        type="number"
                                        id="all-buffer-after"
                                        value={allProvidersAfter}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setAllProvidersAfter(value);
                                          } else if (value === '') {
                                            setAllProvidersAfter('0');
                                          }
                                        }}
                                        style={{ width: '100px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FlexItem>
                                    <FlexItem>
                                      <span style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                                        (0-7 days)
                                      </span>
                                    </FlexItem>
                                  </Flex>
                                </FormGroup>
                              </StackItem>
                            </Stack>
                          </div>
                          )}
                        </StackItem>

                        {/* Option 2: Customize per provider */}
                        <StackItem>
                          <Radio
                            id="custom-per-provider"
                            name="custom-mode"
                            label="Customize per cloud provider"
                            description="Configure different buffer periods for each cloud provider"
                            isChecked={customMode === 'per-provider'}
                            onChange={() => setCustomMode('per-provider')}
                          />
                          {customMode === 'per-provider' && (
                          <div style={{ marginLeft: 'var(--pf-t--global--spacer--lg)' }}>
                            <Stack hasGutter>
                              {/* Amazon Web Services */}
                              <StackItem>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                  <FlexItem style={{ minWidth: '200px' }}>
                                    <strong>Amazon Web Services</strong>
                                  </FlexItem>
                                  <FlexItem>
                                    <FormGroup label="Days before" fieldId="aws-buffer-before" style={{ marginBottom: 0 }}>
                                      <TextInput
                                        type="number"
                                        id="aws-buffer-before"
                                        value={providerBuffers.aws.before}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              aws: { ...providerBuffers.aws, before: value }
                                            });
                                          } else if (value === '') {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              aws: { ...providerBuffers.aws, before: '0' }
                                            });
                                          }
                                        }}
                                        style={{ width: '80px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FormGroup>
                                  </FlexItem>
                                  <FlexItem>
                                    <FormGroup label="Days after" fieldId="aws-buffer-after" style={{ marginBottom: 0 }}>
                                      <TextInput
                                        type="number"
                                        id="aws-buffer-after"
                                        value={providerBuffers.aws.after}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              aws: { ...providerBuffers.aws, after: value }
                                            });
                                          } else if (value === '') {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              aws: { ...providerBuffers.aws, after: '0' }
                                            });
                                          }
                                        }}
                                        style={{ width: '80px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FormGroup>
                                  </FlexItem>
                                </Flex>
                              </StackItem>

                              {/* Google Cloud */}
                              <StackItem>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                  <FlexItem style={{ minWidth: '200px' }}>
                                    <strong>Google Cloud</strong>
                                  </FlexItem>
                                  <FlexItem>
                                    <FormGroup label="Days before" fieldId="gcp-buffer-before" style={{ marginBottom: 0 }}>
                                      <TextInput
                                        type="number"
                                        id="gcp-buffer-before"
                                        value={providerBuffers.gcp.before}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              gcp: { ...providerBuffers.gcp, before: value }
                                            });
                                          } else if (value === '') {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              gcp: { ...providerBuffers.gcp, before: '0' }
                                            });
                                          }
                                        }}
                                        style={{ width: '80px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FormGroup>
                                  </FlexItem>
                                  <FlexItem>
                                    <FormGroup label="Days after" fieldId="gcp-buffer-after" style={{ marginBottom: 0 }}>
                                      <TextInput
                                        type="number"
                                        id="gcp-buffer-after"
                                        value={providerBuffers.gcp.after}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              gcp: { ...providerBuffers.gcp, after: value }
                                            });
                                          } else if (value === '') {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              gcp: { ...providerBuffers.gcp, after: '0' }
                                            });
                                          }
                                        }}
                                        style={{ width: '80px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FormGroup>
                                  </FlexItem>
                                </Flex>
                              </StackItem>

                              {/* Microsoft Azure */}
                              <StackItem>
                                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                  <FlexItem style={{ minWidth: '200px' }}>
                                    <strong>Microsoft Azure</strong>
                                  </FlexItem>
                                  <FlexItem>
                                    <FormGroup label="Days before" fieldId="azure-buffer-before" style={{ marginBottom: 0 }}>
                                      <TextInput
                                        type="number"
                                        id="azure-buffer-before"
                                        value={providerBuffers.azure.before}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              azure: { ...providerBuffers.azure, before: value }
                                            });
                                          } else if (value === '') {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              azure: { ...providerBuffers.azure, before: '0' }
                                            });
                                          }
                                        }}
                                        style={{ width: '80px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FormGroup>
                                  </FlexItem>
                                  <FlexItem>
                                    <FormGroup label="Days after" fieldId="azure-buffer-after" style={{ marginBottom: 0 }}>
                                      <TextInput
                                        type="number"
                                        id="azure-buffer-after"
                                        value={providerBuffers.azure.after}
                                        onChange={(_event, value) => {
                                          const numValue = parseInt(value, 10);
                                          if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              azure: { ...providerBuffers.azure, after: value }
                                            });
                                          } else if (value === '') {
                                            setProviderBuffers({
                                              ...providerBuffers,
                                              azure: { ...providerBuffers.azure, after: '0' }
                                            });
                                          }
                                        }}
                                        style={{ width: '80px' }}
                                        min={0}
                                        max={7}
                                      />
                                    </FormGroup>
                                  </FlexItem>
                                </Flex>
                              </StackItem>
                            </Stack>
                          </div>
                          )}
                        </StackItem>
                      </Stack>
                    </div>
                  )}
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
        aria-labelledby="create-cost-model-wizard-title"
      >
        <Wizard
          onClose={() => setIsWizardOpen(false)}
          header={
            <div style={{ 
              padding: '24px', 
              backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
              borderBottom: '1px solid var(--pf-t--global--border--color--default)'
            }}>
              <Title headingLevel="h1" size="2xl" style={{ marginBottom: '8px' }}>
                Create a cost model
              </Title>
              <p style={{ color: 'var(--pf-t--global--text--color--subtle)', margin: 0 }}>
                A cost model allows you to associate a price to metrics provided by your integrations to charge for utilization of resources.
              </p>
            </div>
          }
        >
          <WizardStep
            name="Enter information"
            id="general-info-step"
            footer={{ isNextDisabled: !wizardName.trim() || !wizardIntegration }}
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
                  <FormGroup 
                    label="Name" 
                    isRequired 
                    fieldId="name"
                  >
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

                  <FormGroup 
                    label="Integration" 
                    isRequired 
                    fieldId="source-type-selector"
                  >
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

          {/* Step 3: ROSA hybrid commitment - only for AWS */}
          {wizardIntegration === 'Amazon Web Services' && (
            <WizardStep
              name="ROSA hybrid commitment"
              id="rosa-commitment-step"
            >
              <Stack hasGutter>
                <StackItem>
                  <Title headingLevel="h2" size="xl" style={{ display: 'inline-block', marginRight: '1em' }}>
                    ROSA hybrid commitment (optional)
                  </Title>
                  <a
                    href="https://docs.redhat.com/en/documentation/cost_management_service/1-latest/html/using_cost_models/assembly-setting-up-cost-models"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 'var(--pf-t--global--font--size--sm)' }}
                  >
                    Learn more
                  </a>
                </StackItem>

                <StackItem>
                  <p style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                    If you have a Red Hat OpenShift Service on AWS (ROSA) private offer or hybrid commitment, enter your committed vCPU hours per month. This commitment applies across all clusters associated with this AWS account.
                  </p>

                  <Form>
                    <FormGroup
                      label="Committed vCPU hours per month"
                      fieldId="rosa-commitment"
                    >
                      <TextInput
                        id="rosa-commitment"
                        type="number"
                        aria-label="ROSA commitment in vCPU hours"
                        placeholder="e.g., 1000"
                        style={{ maxWidth: '300px' }}
                      />
                      <div style={{ marginTop: '0.5rem', fontSize: 'var(--pf-t--global--font--size--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                        Enter the total vCPU hours you've committed to across all clusters. In the future, this may be auto-discovered from your AWS bill.
                      </div>
                    </FormGroup>

                    <FormGroup
                      label="Discount rate"
                      fieldId="rosa-discount"
                    >
                      <TextInput
                        id="rosa-discount"
                        type="number"
                        aria-label="Discount rate percentage"
                        placeholder="e.g., 15"
                        style={{ maxWidth: '300px' }}
                      />
                      <div style={{ marginTop: '0.5rem', fontSize: 'var(--pf-t--global--font--size--sm)', color: 'var(--pf-t--global--text--color--subtle)' }}>
                        Enter the discount percentage you receive for your prepaid commitment (optional).
                      </div>
                    </FormGroup>
                  </Form>
                </StackItem>
              </Stack>
            </WizardStep>
          )}

          {/* Step 4: Assign integrations - only for AWS */}
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

          {/* Step 5: Review details - only for AWS */}
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

