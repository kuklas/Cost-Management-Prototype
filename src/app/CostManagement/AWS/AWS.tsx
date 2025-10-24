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
  Checkbox,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import { 
  FilterIcon, 
  ExportIcon, 
  EllipsisVIcon,
  CheckCircleIcon,
  PauseIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { dataService } from '@app/data/dataService';

interface AccountItem {
  id: string;
  name: string;
  alias?: string;
  momChange: number;
  momPrevCost: string;
  cost: string;
  costPercent: string;
}

const AWS: React.FunctionComponent = () => {
  const [currencyOpen, setCurrencyOpen] = React.useState(false);
  const [groupByOpen, setGroupByOpen] = React.useState(false);
  const [showCostAsOpen, setShowCostAsOpen] = React.useState(false);
  const [dateRangeOpen, setDateRangeOpen] = React.useState(false);
  const [categoryOpen, setCategoryOpen] = React.useState(false);
  const [operatorOpen, setOperatorOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortIndex, setSortIndex] = React.useState<number>(3);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('desc');
  const [selectAll, setSelectAll] = React.useState(false);

  // Get data from database
  const dbAccounts = dataService.getAWSAccounts();
  const totalAWSCost = dataService.getAWSTotalCost();

  // Transform accounts data for the UI
  const accounts: AccountItem[] = dbAccounts.map(account => {
    const percentage = (account.cost / totalAWSCost) * 100;
    const prevCost = account.cost / (1 + (account.monthOverMonthChange / 100));
    
    return {
      id: account.accountNumber,
      name: account.displayName,
      alias: account.accountNumber,
      momChange: account.monthOverMonthChange,
      momPrevCost: dataService.formatCurrency(prevCost),
      cost: dataService.formatCurrency(account.cost),
      costPercent: percentage.toFixed(2),
    };
  });

  const totalItems = accounts.length;

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
              <BreadcrumbItem to="/cost-management/aws" isActive>Amazon Web Services</BreadcrumbItem>
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
          {/* Title and Currency Row */}
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Title headingLevel="h1" size="2xl" style={{ paddingBottom: 'var(--pf-t--global--spacer--sm)' }}>
                Amazon Web Services details
              </Title>
            </FlexItem>
            <FlexItem>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <Title headingLevel="h2" size="md" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
                  Currency
                </Title>
                <Select
                  isOpen={currencyOpen}
                  onSelect={() => setCurrencyOpen(false)}
                  onOpenChange={(isOpen) => setCurrencyOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle 
                      ref={toggleRef} 
                      onClick={() => setCurrencyOpen(!currencyOpen)} 
                      isExpanded={currencyOpen}
                      style={{ width: '280px' }}
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
            </FlexItem>
          </Flex>

          {/* Integration Status and Total Cost Row */}
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <span style={{ marginRight: '0.5rem' }}>Integrations status</span>
              <span style={{ marginRight: '0.5rem' }}>3</span>
              <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" style={{ fontSize: '0.75rem', paddingRight: '0.5rem' }} />
              <span style={{ marginRight: '0.5rem' }}>1</span>
              <PauseIcon style={{ fontSize: '0.75rem', paddingRight: '0.5rem' }} />
              <Button variant="link" style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)', padding: 0 }}>
                View all
              </Button>
            </FlexItem>
            <FlexItem alignSelf={{ default: 'alignSelfCenter' }} style={{ textAlign: 'end' }}>
              <Title headingLevel="h2" size="3xl" style={{ marginBottom: 0 }}>$20,729.73</Title>
            </FlexItem>
          </Flex>

          {/* Controls and Date Row */}
          <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                {/* Group by */}
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <Title headingLevel="h3" size="md" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
                    Group by
                  </Title>
                  <Select
                    isOpen={groupByOpen}
                    onSelect={() => setGroupByOpen(false)}
                    onOpenChange={(isOpen) => setGroupByOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setGroupByOpen(!groupByOpen)} 
                        isExpanded={groupByOpen}
                      >
                        Account
                      </MenuToggle>
                    )}
                  >
                    <SelectList>
                      <SelectOption value="Account">Account</SelectOption>
                      <SelectOption value="Service">Service</SelectOption>
                      <SelectOption value="Region">Region</SelectOption>
                    </SelectList>
                  </Select>
                </Flex>

                {/* Show cost as */}
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                  <Title headingLevel="h2" size="md" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>
                    Show cost as
                  </Title>
                  <Select
                    isOpen={showCostAsOpen}
                    onSelect={() => setShowCostAsOpen(false)}
                    onOpenChange={(isOpen) => setShowCostAsOpen(isOpen)}
                    toggle={(toggleRef) => (
                      <MenuToggle 
                        ref={toggleRef} 
                        onClick={() => setShowCostAsOpen(!showCostAsOpen)} 
                        isExpanded={showCostAsOpen}
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

                {/* Date Range */}
                <Select
                  isOpen={dateRangeOpen}
                  onSelect={() => setDateRangeOpen(false)}
                  onOpenChange={(isOpen) => setDateRangeOpen(isOpen)}
                  toggle={(toggleRef) => (
                    <MenuToggle 
                      ref={toggleRef} 
                      onClick={() => setDateRangeOpen(!dateRangeOpen)} 
                      isExpanded={dateRangeOpen}
                    >
                      Month to date
                    </MenuToggle>
                  )}
                >
                  <SelectList>
                    <SelectOption value="mtd">Month to date</SelectOption>
                    <SelectOption value="ytd">Year to date</SelectOption>
                  </SelectList>
                </Select>
              </Flex>
            </FlexItem>
            <FlexItem alignSelf={{ default: 'alignSelfCenter' }} style={{ textAlign: 'end' }}>
              October 1 – 24
            </FlexItem>
          </Flex>
        </Flex>
      </PageSection>

      {/* Main Content */}
      <PageSection>
        <Card>
          <CardBody>
            {/* Toolbar */}
            <Toolbar id="aws-toolbar">
              <ToolbarContent>
                <ToolbarItem>
                  <Checkbox
                    id="bulk-select"
                    aria-label="Select all items"
                    isChecked={selectAll}
                    onChange={(_event, checked) => setSelectAll(checked)}
                  />
                </ToolbarItem>

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
                            Account
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          <SelectOption value="Account">Account</SelectOption>
                          <SelectOption value="Service">Service</SelectOption>
                        </SelectList>
                      </Select>
                    </ToolbarItem>
                    <ToolbarItem>
                      <Select
                        isOpen={operatorOpen}
                        onSelect={() => setOperatorOpen(false)}
                        onOpenChange={(isOpen) => setOperatorOpen(isOpen)}
                        toggle={(toggleRef) => (
                          <MenuToggle 
                            ref={toggleRef} 
                            onClick={() => setOperatorOpen(!operatorOpen)} 
                            isExpanded={operatorOpen}
                          >
                            includes
                          </MenuToggle>
                        )}
                      >
                        <SelectList>
                          <SelectOption value="includes">includes</SelectOption>
                          <SelectOption value="excludes">excludes</SelectOption>
                        </SelectList>
                      </Select>
                    </ToolbarItem>
                    <ToolbarItem>
                      <SearchInput
                        placeholder="Filter by account"
                        value={searchValue}
                        onChange={(_event, value) => setSearchValue(value)}
                        onClear={() => setSearchValue('')}
                      />
                    </ToolbarItem>
                  </ToolbarGroup>
                </ToolbarToggleGroup>

                <ToolbarGroup>
                  <ToolbarItem>
                    <Button variant="plain" aria-label="Export data" isDisabled>
                      <ExportIcon />
                    </Button>
                  </ToolbarItem>
                </ToolbarGroup>

                <ToolbarItem variant="pagination" align={{ default: 'alignEnd' }}>
                  <Pagination
                    itemCount={totalItems}
                    perPage={perPage}
                    page={page}
                    onSetPage={(_evt, newPage) => setPage(newPage)}
                    widgetId="aws-pagination-top"
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
            <Table aria-label="Amazon Web Services details table" variant="compact" gridBreakPoint="grid-2xl">
              <Thead>
                <Tr>
                  <Th />
                  <Th sort={getSortParams(1)} modifier="nowrap">Account names</Th>
                  <Th modifier="nowrap">Month over month change</Th>
                  <Th 
                    sort={getSortParams(3)} 
                    modifier="nowrap"
                    style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', paddingRight: 0 }}
                  >
                    Cost
                  </Th>
                  <Th modifier="nowrap" />
                </Tr>
              </Thead>
              <Tbody>
                {accounts.map((account, index) => (
                  <Tr key={account.id}>
                    <Td 
                      select={{
                        rowIndex: index,
                        onSelect: () => {},
                        isSelected: false,
                      }}
                    />
                    <Td dataLabel="Account names" modifier="nowrap">
                      <Link to={`/cost-management/aws/breakdown?breakdown_title=${account.name}&group_by[account]=${account.id}`}>
                        {account.name}
                      </Link>
                      {account.alias && (
                        <div style={{ color: 'rgb(56, 56, 56)', fontSize: '0.75rem' }}>
                          {account.alias}
                        </div>
                      )}
                    </Td>
                    <Td dataLabel="Month over month change" modifier="nowrap">
                      <div>
                        <div style={{ color: account.momChange < 0 ? 'var(--pf-t--global--color--status--success--default)' : 'var(--pf-t--global--color--status--danger--default)' }}>
                          {Math.abs(account.momChange)} %
                          {account.momChange < 0 ? (
                            <SortAmountDownIcon style={{ marginLeft: '4px', position: 'relative', bottom: '0.25rem' }} />
                          ) : (
                            <SortAmountUpIcon style={{ marginLeft: '4px', position: 'relative' }} />
                          )}
                        </div>
                        <div style={{ color: 'rgb(56, 56, 56)', fontSize: '0.75rem' }}>
                          {account.momPrevCost} for September 1 – 23
                        </div>
                      </div>
                    </Td>
                    <Td dataLabel="Cost" modifier="nowrap" style={{ textAlign: 'right' }}>
                      {account.cost}
                      <div style={{ color: 'rgb(56, 56, 56)', fontSize: '0.75rem' }}>
                        {account.costPercent} % of cost
                      </div>
                    </Td>
                    <Td isActionCell>
                      <MenuToggle variant="plain" aria-label="More options">
                        <EllipsisVIcon />
                      </MenuToggle>
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
                widgetId="aws-pagination-bottom"
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

export { AWS };

