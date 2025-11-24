import * as React from 'react';
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Tabs,
  Tab,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarGroup,
  ToolbarToggleGroup,
  SearchInput,
  Button,
  Pagination,
  PaginationVariant,
  Label,
  ToggleGroup,
  ToggleGroupItem,
  Popover,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import { 
  OutlinedQuestionCircleIcon,
  FilterIcon, 
  ExportIcon,
  SortAmountDownIcon,
  SortAmountUpIcon,
} from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '@app/utils/useDocumentTitle';

interface OptimizationItem {
  id: string;
  projectName: string;
  workloadName?: string;
  workloadType: string;
  clusterName: string;
  currentMemory: string | null;
  currentCPU: string | null;
  recommendedMemory: string | null;
  recommendedCPU: string | null;
  memoryChange: number | null;
  cpuChange: number | null;
  lastReported: string;
}

const OptimizationsOverview: React.FunctionComponent = () => {
  const [activeTabKey, setActiveTabKey] = React.useState<string | number>(0);
  const [timeRangeOpen, setTimeRangeOpen] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('Last 30 days');
  const [clusterSelectOpen, setClusterSelectOpen] = React.useState(false);
  const [selectedCluster, setSelectedCluster] = React.useState('all');

  // Recommendations visibility states
  const [showRecommendations, setShowRecommendations] = React.useState({
    usage: false,
    waste: false,
    cost: false,
    overhead: false
  });

  // Show more factors states
  const [showAllFactors, setShowAllFactors] = React.useState({
    usage: false,
    waste: false,
    cost: false,
    overhead: false
  });
  
  // Optimizations tab states
  const [activeView, setActiveView] = React.useState<string>('projects');
  const [optimizeForOpen, setOptimizeForOpen] = React.useState(false);
  const [optimizeFor, setOptimizeFor] = React.useState('Performance');
  const [projectFilterOpen, setProjectFilterOpen] = React.useState(false);
  const [projectFilter, setProjectFilter] = React.useState('Project');
  const [searchValue, setSearchValue] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [sortIndex, setSortIndex] = React.useState<number>(0);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  useDocumentTitle('Cost Management | Optimizations');

  // Mock cluster data for multiple clusters
  const allClustersData = [
    {
      id: 'demolab',
      name: 'demolab',
      requestedCapacity: 1000,
      usage: 650,
      idle: 350,
      totalClusterSpend: 50000,
      workerUnallocatedSpend: 7500,
      overheadCapacityCost: 5000,
      totalCapacityCost: 45000,
    },
    {
      id: 'production-east',
      name: 'production-east',
      requestedCapacity: 2000,
      usage: 1100,
      idle: 900, // High waste!
      totalClusterSpend: 120000,
      workerUnallocatedSpend: 25000, // High unallocated!
      overheadCapacityCost: 15000,
      totalCapacityCost: 100000,
    },
    {
      id: 'production-west',
      name: 'production-west',
      requestedCapacity: 1500,
      usage: 1200,
      idle: 300,
      totalClusterSpend: 80000,
      workerUnallocatedSpend: 8000,
      overheadCapacityCost: 6000,
      totalCapacityCost: 70000,
    }
  ];

  // Calculate aggregates or get single cluster data
  const clusterData = selectedCluster === 'all' 
    ? {
        name: 'All clusters',
        requestedCapacity: allClustersData.reduce((sum, c) => sum + c.requestedCapacity, 0),
        usage: allClustersData.reduce((sum, c) => sum + c.usage, 0),
        idle: allClustersData.reduce((sum, c) => sum + c.idle, 0),
        totalClusterSpend: allClustersData.reduce((sum, c) => sum + c.totalClusterSpend, 0),
        workerUnallocatedSpend: allClustersData.reduce((sum, c) => sum + c.workerUnallocatedSpend, 0),
        overheadCapacityCost: allClustersData.reduce((sum, c) => sum + c.overheadCapacityCost, 0),
        totalCapacityCost: allClustersData.reduce((sum, c) => sum + c.totalCapacityCost, 0),
      }
    : allClustersData.find(c => c.id === selectedCluster) || allClustersData[0];

  // Calculate efficiency for each cluster to find worst performers
  const clusterEfficiencies = allClustersData.map(cluster => ({
    ...cluster,
    usageEff: Math.round(((cluster.requestedCapacity - cluster.idle) / cluster.requestedCapacity) * 100),
    wasteScore: Math.round((cluster.idle / cluster.requestedCapacity) * 100),
    costEff: Math.round(((cluster.totalClusterSpend - cluster.workerUnallocatedSpend) / cluster.totalClusterSpend) * 100),
    overheadEff: Math.round(((cluster.totalCapacityCost - cluster.overheadCapacityCost) / cluster.totalCapacityCost) * 100),
  }));

  // Find worst performing clusters for each metric (sorted by worst first)
  const worstClusters = {
    usage: [...clusterEfficiencies].sort((a, b) => a.usageEff - b.usageEff),
    waste: [...clusterEfficiencies].sort((a, b) => b.wasteScore - a.wasteScore),
    cost: [...clusterEfficiencies].sort((a, b) => a.costEff - b.costEff),
    overhead: [...clusterEfficiencies].sort((a, b) => a.overheadEff - b.overheadEff),
  };

  // Calculate efficiency scores based on formulas from COST-6287
  const usageEfficiency = {
    value: Math.round(((clusterData.requestedCapacity - clusterData.idle) / clusterData.requestedCapacity) * 100),
    label: 'Usage efficiency',
    description: 'Based on usage vs capacity',
    betterDirection: 'higher',
    formula: '(Requested capacity - Idle capacity) / Requested capacity',
    calculation: `(${clusterData.requestedCapacity} - ${clusterData.idle}) / ${clusterData.requestedCapacity}`,
    interpretation: 'Higher values indicate better utilization of requested resources'
  };

  const wasteScore = {
    value: Math.round((clusterData.idle / clusterData.requestedCapacity) * 100),
    label: 'Waste score',
    description: 'Idle vs requested capacity',
    betterDirection: 'lower',
    formula: 'Idle capacity / Requested capacity',
    calculation: `${clusterData.idle} / ${clusterData.requestedCapacity}`,
    interpretation: 'Lower values indicate less waste. Negative values may indicate poor planning.'
  };

  const costEfficiency = {
    value: Math.round(((clusterData.totalClusterSpend - clusterData.workerUnallocatedSpend) / clusterData.totalClusterSpend) * 100),
    label: 'Cost efficiency',
    description: 'Cost used vs total cost',
    betterDirection: 'higher',
    formula: '(Total cluster spend - Worker unallocated spend) / Total cluster spend',
    calculation: `($${clusterData.totalClusterSpend} - $${clusterData.workerUnallocatedSpend}) / $${clusterData.totalClusterSpend}`,
    interpretation: 'Higher values indicate better cost utilization'
  };

  const overheadScore = {
    value: Math.round(((clusterData.totalCapacityCost - clusterData.overheadCapacityCost) / clusterData.totalCapacityCost) * 100),
    label: 'Overhead efficiency',
    description: 'Platform overhead vs capacity',
    betterDirection: 'higher',
    formula: '(Total capacity cost - Overhead capacity cost) / Total capacity cost',
    calculation: `($${clusterData.totalCapacityCost} - $${clusterData.overheadCapacityCost}) / $${clusterData.totalCapacityCost}`,
    interpretation: 'Higher values indicate less overhead relative to total capacity'
  };

  // Mock data for Containers view
  const containersData: OptimizationItem[] = [
    {
      id: 'c1',
      projectName: 'thanos',
      workloadName: 'thanos-receive',
      workloadType: 'platform',
      clusterName: 'demolab',
      currentMemory: '64MiB',
      currentCPU: '300mcore',
      recommendedMemory: '50MiB',
      recommendedCPU: '250mcore',
      memoryChange: -12,
      cpuChange: +12,
      lastReported: '3 hours ago',
    },
    {
      id: 'c2',
      projectName: 'thanos',
      workloadName: 'thanos-receive',
      workloadType: 'platform',
      clusterName: 'demolab',
      currentMemory: null,
      currentCPU: null,
      recommendedMemory: '23.13Mi',
      recommendedCPU: null,
      memoryChange: null,
      cpuChange: null,
      lastReported: '3 hours ago',
    },
  ];

  // Mock data for Projects view
  const projectsData: OptimizationItem[] = [
    {
      id: 'p1',
      projectName: 'thanos',
      workloadType: 'platform',
      clusterName: 'demolab',
      currentMemory: '128MiB',
      currentCPU: '600mcore',
      recommendedMemory: '100MiB',
      recommendedCPU: '500mcore',
      memoryChange: -20,
      cpuChange: -16,
      lastReported: '1 hour ago',
    },
    {
      id: 'p2',
      projectName: 'cost-management-metrics-operator',
      workloadType: 'project',
      clusterName: 'demolab',
      currentMemory: '256MiB',
      currentCPU: '1000mcore',
      recommendedMemory: '200MiB',
      recommendedCPU: '870mcore',
      memoryChange: -22,
      cpuChange: -13,
      lastReported: '2 hours ago',
    },
  ];

  const data = activeView === 'projects' ? projectsData : containersData;
  const totalItems = activeView === 'projects' ? projectsData.length : containersData.length;

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

  // Calculate gauge colors based on value and direction
  const getGaugeColor = (value: number, betterDirection: string) => {
    // For "lower is better" metrics, invert the logic
    const effectiveValue = betterDirection === 'lower' ? (100 - value) : value;
    
    if (effectiveValue < 50) return '#C9190B'; // Red
    if (effectiveValue < 70) return '#F0AB00'; // Yellow/Orange
    return '#3E8635'; // Green
  };

  const renderGauge = (efficiency: any, formulaKey: 'usage' | 'waste' | 'cost' | 'overhead', recommendations: { short: string[]; detailed: string[] }, worstClustersList?: any[]) => {
    const percentage = efficiency.value;
    const rotation = (percentage / 100) * 180; // 180 degrees for semicircle
    const color = getGaugeColor(percentage, efficiency.betterDirection);
    const showRecs = showRecommendations[formulaKey];
    const showAll = showAllFactors[formulaKey];

    const toggleRecommendations = () => {
      setShowRecommendations(prev => ({
        ...prev,
        [formulaKey]: !prev[formulaKey]
      }));
    };

    const toggleFactors = () => {
      setShowAllFactors(prev => ({
        ...prev,
        [formulaKey]: !prev[formulaKey]
      }));
    };

    return (
      <Card style={{ height: '100%', background: 'white', border: '1px solid #d2d2d2' }}>
        <CardBody>
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
            {/* Header */}
            <FlexItem>
              <Flex direction={{ default: 'column' }}>
                <FlexItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                    <FlexItem>
                      <Title headingLevel="h3" size="lg" style={{ color: '#151515' }}>
                        {efficiency.label}
                      </Title>
                    </FlexItem>
                    <FlexItem>
                      <Popover
                        headerContent={<div>How this is calculated</div>}
                        bodyContent={
                          <div style={{ fontSize: '12px' }}>
                            <div style={{ color: '#151515', marginBottom: '0.5rem', fontWeight: 600 }}>
                              Formula:
                            </div>
                            <code style={{ 
                              color: '#0066cc', 
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              display: 'block',
                              marginBottom: '0.75rem'
                            }}>
                              {efficiency.formula}
                            </code>
                            
                            <div style={{ color: '#151515', marginBottom: '0.5rem', fontWeight: 600 }}>
                              Calculation:
                            </div>
                            <code style={{ 
                              color: '#4d4d4d', 
                              fontSize: '11px',
                              fontFamily: 'monospace',
                              display: 'block'
                            }}>
                              {efficiency.calculation} = {percentage}%
                            </code>
                          </div>
                        }
                        position="right"
                      >
                        <Button 
                          variant="plain" 
                          aria-label="Show calculation"
                          style={{ padding: 0, minWidth: 'auto' }}
                        >
                          <OutlinedQuestionCircleIcon style={{ color: '#6a6e73', fontSize: '16px' }} />
                        </Button>
                      </Popover>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <span style={{ fontSize: '13px', color: '#6a6e73' }}>
                    {efficiency.description}
                  </span>
                </FlexItem>
              </Flex>
            </FlexItem>

            {/* Gauge Chart */}
            <FlexItem style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '200px', height: '120px' }}>
                  {/* Background arc */}
                  <svg width="200" height="120" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={`gradient-${efficiency.label.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C9190B" />
                        <stop offset="50%" stopColor="#F0AB00" />
                        <stop offset="100%" stopColor="#3E8635" />
                      </linearGradient>
                    </defs>
                    {/* Background track */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    {/* Colored progress arc */}
                    <path
                      d="M 20 100 A 80 80 0 0 1 180 100"
                      fill="none"
                      stroke={`url(#gradient-${efficiency.label.replace(/\s+/g, '-')})`}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${(percentage / 100) * 251.2} 251.2`}
                    />
                    {/* Needle */}
                    <line
                      x1="100"
                      y1="100"
                      x2="100"
                      y2="30"
                      stroke="#8a8d90"
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{
                        transformOrigin: '100px 100px',
                        transform: `rotate(${rotation - 90}deg)`,
                        transition: 'transform 1s ease-out'
                      }}
                    />
                    {/* Center dot */}
                    <circle cx="100" cy="100" r="3" fill="#8a8d90" />
                  </svg>
                  
                  {/* Center value */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -20%)',
                    fontSize: '36px',
                    fontWeight: 300,
                    color: '#151515'
                  }}>
                    {percentage}%
                  </div>
                </div>
                
                {/* Labels below chart */}
                <div style={{ 
                  position: 'relative',
                  width: '200px',
                  marginTop: '0.5rem',
                  height: '20px'
                }}>
                  {/* 0% aligned with arc start */}
                  <div style={{ 
                    position: 'absolute',
                    left: '14px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#151515'
                  }}>
                    0%
                  </div>
                  
                  {/* Target range indicator in center */}
                  <div style={{ 
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '11px',
                    color: '#3E8635',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    {efficiency.betterDirection === 'higher' ? 'Target: 80-100%' : 'Target: 0-20%'}
                  </div>
                  
                  {/* 100% aligned with arc end */}
                  <div style={{ 
                    position: 'absolute',
                    right: '8px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#151515'
                  }}>
                    100%
                  </div>
                </div>
                
                <div style={{ 
                  marginTop: '0.5rem',
                  fontSize: '13px',
                  color: '#6a6e73',
                  lineHeight: '1.5',
                  textAlign: 'center'
                }}>
                  Cluster: {clusterData.name}
                </div>
              </div>
            </FlexItem>

            {/* Recommendations */}
            <FlexItem style={{ paddingTop: '1rem', borderTop: '1px solid #d2d2d2' }}>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <div style={{ color: '#151515', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 600 }}>
                    Recommendations
                  </div>
                </FlexItem>
                <FlexItem>
                  <ul style={{ color: '#4d4d4d', fontSize: '12px', lineHeight: '1.5', paddingLeft: '1.2rem', margin: 0 }}>
                    {recommendations.short.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                    ))}
                  </ul>
                </FlexItem>
                
                {recommendations.detailed.length > 0 && (
                  <FlexItem>
                    <Button 
                      variant="link" 
                      onClick={toggleRecommendations}
                      style={{ padding: 0, fontSize: '12px', color: '#0066cc' }}
                    >
                      {showRecs ? '− Show less' : `+ ${recommendations.detailed.length} more`}
                    </Button>
                  </FlexItem>
                )}

                {showRecs && (
                  <FlexItem>
                    <ul style={{ color: '#4d4d4d', fontSize: '12px', lineHeight: '1.5', paddingLeft: '1.2rem', margin: 0 }}>
                      {recommendations.detailed.map((rec, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                      ))}
                    </ul>
                  </FlexItem>
                )}
              </Flex>
            </FlexItem>

            {/* Factors affecting the score (only show in Overall view) */}
            {selectedCluster === 'all' && worstClustersList && worstClustersList.length > 0 && (
              <FlexItem style={{ paddingTop: '1rem', borderTop: '1px solid #d2d2d2' }}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                  <FlexItem>
                    <div style={{ color: '#151515', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 600 }}>
                      Top 3 clusters affecting this metric
                    </div>
                  </FlexItem>
                  
                  {/* Compact table-like structure */}
                  <FlexItem>
                    <div style={{ 
                      fontSize: '12px',
                      borderBottom: '1px solid #d2d2d2'
                    }}>
                      {(showAll ? worstClustersList : worstClustersList.slice(0, 3)).map((cluster, index) => (
                        <div 
                          key={cluster.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0',
                            borderTop: index === 0 ? 'none' : '1px solid #f0f0f0'
                          }}
                        >
                          <span>
                            <span style={{ color: '#6a6e73', marginRight: '0.5rem', fontSize: '11px' }}>#{index + 1}</span>
                            <span style={{ color: '#151515' }}>{cluster.name}</span>
                          </span>
                          <span style={{ fontWeight: 600, color: '#151515' }}>
                            {formulaKey === 'usage' ? cluster.usageEff : 
                             formulaKey === 'waste' ? cluster.wasteScore :
                             formulaKey === 'cost' ? cluster.costEff :
                             cluster.overheadEff}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </FlexItem>

                  {/* See more/less button */}
                  {worstClustersList.length > 3 && (
                    <FlexItem style={{ marginTop: '0.5rem' }}>
                      <Button 
                        variant="link" 
                        onClick={toggleFactors}
                        style={{ padding: 0, fontSize: '12px', color: '#0066cc' }}
                      >
                        {showAll ? '− Show less' : `+ See ${worstClustersList.length - 3} more`}
                      </Button>
                    </FlexItem>
                  )}
                </Flex>
              </FlexItem>
            )}
          </Flex>
        </CardBody>
      </Card>
    );
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
              <BreadcrumbItem to="/cost-management/optimizations">Optimizations</BreadcrumbItem>
              <BreadcrumbItem isActive>Overview</BreadcrumbItem>
            </Breadcrumb>
          </FlexItem>
        </Flex>
      </PageSection>

      {/* Header Section */}
      <PageSection style={{ paddingBottom: 0 }}>
        <Title headingLevel="h1" size="2xl" style={{ marginBottom: '1.5rem' }}>
          Optimizations
        </Title>

        <Tabs
          activeKey={activeTabKey}
          onSelect={(_event, tabIndex) => setActiveTabKey(tabIndex)}
          aria-label="Optimizations tabs"
          role="region"
        >
          <Tab eventKey={0} title={<TabTitleText>Overview</TabTitleText>} />
          <Tab eventKey={1} title={<TabTitleText>Optimizations</TabTitleText>} />
        </Tabs>
      </PageSection>

      {/* Main Content */}
      <PageSection>
        {activeTabKey === 0 && (
          <>
            {/* Cluster and Time Range Selectors */}
            <Card style={{ marginBottom: '1rem' }}>
              <CardBody>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  {/* Cluster Selector */}
                  <FlexItem>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <span style={{ fontSize: '14px', color: '#6a6e73', fontWeight: 600 }}>
                          Select cluster:
                        </span>
                      </FlexItem>
                      <FlexItem>
                        <Select
                          isOpen={clusterSelectOpen}
                          onSelect={(_event, value) => {
                            setSelectedCluster(value as string);
                            setClusterSelectOpen(false);
                          }}
                          onOpenChange={(isOpen) => setClusterSelectOpen(isOpen)}
                          selected={selectedCluster}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setClusterSelectOpen(!clusterSelectOpen)}
                              isExpanded={clusterSelectOpen}
                              style={{ minWidth: '220px' }}
                            >
                              {selectedCluster === 'all' ? 'All clusters (Overall)' : clusterData.name}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="all">All clusters (Overall)</SelectOption>
                            {allClustersData.map(cluster => (
                              <SelectOption key={cluster.id} value={cluster.id}>
                                {cluster.name}
                              </SelectOption>
                            ))}
                          </SelectList>
                        </Select>
                      </FlexItem>
                    </Flex>
                  </FlexItem>

                  {/* Time Range Selector - 24px spacing */}
                  <FlexItem style={{ marginLeft: '24px' }}>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <span style={{ fontSize: '14px', color: '#6a6e73', fontWeight: 600 }}>
                          Select time range:
                        </span>
                      </FlexItem>
                      <FlexItem>
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
                              style={{ minWidth: '180px' }}
                            >
                              {timeRange}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="Last 7 days">Last 7 days</SelectOption>
                            <SelectOption value="Last 30 days">Last 30 days</SelectOption>
                            <SelectOption value="Last 60 days">Last 60 days</SelectOption>
                            <SelectOption value="Last 90 days">Last 90 days</SelectOption>
                          </SelectList>
                        </Select>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </CardBody>
            </Card>

            {/* Efficiency Gauges - All 4 Metrics in a Row */}
            <Grid hasGutter>
              <GridItem span={3}>
                {renderGauge(usageEfficiency, 'usage', {
                  short: ['Review pod requests', 'Use Optimizations tab'],
                  detailed: ['Identify and terminate idle workloads', 'Implement horizontal pod autoscaling']
                }, worstClusters.usage)}
              </GridItem>
              <GridItem span={3}>
                {renderGauge(wasteScore, 'waste', {
                  short: ['Right-size container requests', 'Implement resource quotas'],
                  detailed: ['Optimize pod resource limits', 'Schedule workloads during off-peak hours']
                }, worstClusters.waste)}
              </GridItem>
              <GridItem span={3}>
                {renderGauge(costEfficiency, 'cost', {
                  short: ['Review node utilization', 'Implement node autoscaling'],
                  detailed: ['Consolidate workloads', 'Use spot/preemptible instances']
                }, worstClusters.cost)}
              </GridItem>
              <GridItem span={3}>
                {renderGauge(overheadScore, 'overhead', {
                  short: ['Optimize platform allocations', 'Right-size monitoring'],
                  detailed: ['Consolidate platform services', 'Review namespace configurations']
                }, worstClusters.overhead)}
              </GridItem>
            </Grid>
          </>
        )}

        {activeTabKey === 1 && (
          <>
            {/* Tabs and Dropdowns Section */}
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsLg' }}>
                  <FlexItem>
                    <ToggleGroup aria-label="Optimization view toggle">
                      <ToggleGroupItem
                        text="Projects"
                        buttonId="projects"
                        isSelected={activeView === 'projects'}
                        onChange={() => setActiveView('projects')}
                      />
                      <ToggleGroupItem
                        text="Containers"
                        buttonId="containers"
                        isSelected={activeView === 'containers'}
                        onChange={() => setActiveView('containers')}
                      />
                    </ToggleGroup>
                  </FlexItem>
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
              </FlexItem>

              <FlexItem>
                {/* Toolbar */}
                <Toolbar id="optimizations-toolbar">
                  <ToolbarContent>
                    <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                      <ToolbarGroup variant="filter-group">
                        <ToolbarItem>
                          <Select
                            isOpen={projectFilterOpen}
                            onSelect={(_event, value) => {
                              setProjectFilter(value as string);
                              setProjectFilterOpen(false);
                            }}
                            onOpenChange={(isOpen) => setProjectFilterOpen(isOpen)}
                            selected={projectFilter}
                            toggle={(toggleRef) => (
                              <MenuToggle
                                ref={toggleRef}
                                onClick={() => setProjectFilterOpen(!projectFilterOpen)}
                                isExpanded={projectFilterOpen}
                                icon={<FilterIcon />}
                              >
                                {projectFilter}
                              </MenuToggle>
                            )}
                          >
                            <SelectList>
                              <SelectOption value="Project">Project</SelectOption>
                              <SelectOption value="Workload">Workload</SelectOption>
                              <SelectOption value="Cluster">Cluster</SelectOption>
                            </SelectList>
                          </Select>
                        </ToolbarItem>
                        <ToolbarItem>
                          <SearchInput
                            placeholder={`Filter by ${projectFilter.toLowerCase()}`}
                            value={searchValue}
                            onChange={(_event, value) => setSearchValue(value)}
                            onClear={() => setSearchValue('')}
                          />
                        </ToolbarItem>
                      </ToolbarGroup>
                    </ToolbarToggleGroup>
                    <ToolbarItem>
                      <Button variant="link" icon={<ExportIcon />}>
                        Export
                      </Button>
                    </ToolbarItem>
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
                <Table aria-label="Optimizations table" variant="compact">
                  <Thead>
                    {activeView === 'projects' ? (
                      <>
                        <Tr>
                          <Th sort={getSortParams(0)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Project names
                          </Th>
                          <Th sort={getSortParams(1)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Project types
                          </Th>
                          <Th sort={getSortParams(2)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Cluster names
                          </Th>
                          <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)', backgroundColor: 'white', paddingTop: 'var(--pf-t--global--spacer--sm)', paddingRight: 'var(--pf-t--global--spacer--md)', paddingBottom: '4px', paddingLeft: 'var(--pf-t--global--spacer--md)' }}>
                            Memory
                          </Th>
                          <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)', backgroundColor: 'white', paddingTop: 'var(--pf-t--global--spacer--sm)', paddingRight: 'var(--pf-t--global--spacer--md)', paddingBottom: '4px', paddingLeft: 'var(--pf-t--global--spacer--md)' }}>
                            CPU
                          </Th>
                          <Th sort={getSortParams(6)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Last reported
                          </Th>
                        </Tr>
                        <Tr>
                          <Th sort={getSortParams(3)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Current
                          </Th>
                          <Th sort={getSortParams(4)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Change
                          </Th>
                          <Th sort={getSortParams(5)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Current
                          </Th>
                          <Th sort={getSortParams(6)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Change
                          </Th>
                        </Tr>
                      </>
                    ) : (
                      <>
                        <Tr>
                          <Th sort={getSortParams(0)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Container names
                          </Th>
                          <Th sort={getSortParams(1)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Workload names
                          </Th>
                          <Th sort={getSortParams(2)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Workload types
                          </Th>
                          <Th sort={getSortParams(3)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Cluster names
                          </Th>
                          <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)', backgroundColor: 'white', paddingTop: 'var(--pf-t--global--spacer--sm)', paddingRight: 'var(--pf-t--global--spacer--md)', paddingBottom: '4px', paddingLeft: 'var(--pf-t--global--spacer--md)' }}>
                            Memory
                          </Th>
                          <Th colSpan={2} style={{ textAlign: 'left', fontWeight: 'var(--pf-t--global--font--weight--body--bold)', backgroundColor: 'white', paddingTop: 'var(--pf-t--global--spacer--sm)', paddingRight: 'var(--pf-t--global--spacer--md)', paddingBottom: '4px', paddingLeft: 'var(--pf-t--global--spacer--md)' }}>
                            CPU
                          </Th>
                          <Th sort={getSortParams(8)} rowSpan={2} modifier="wrap" style={{ verticalAlign: 'middle' }}>
                            Last reported
                          </Th>
                        </Tr>
                        <Tr>
                          <Th sort={getSortParams(4)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Current
                          </Th>
                          <Th sort={getSortParams(5)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Change
                          </Th>
                          <Th sort={getSortParams(6)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Current
                          </Th>
                          <Th sort={getSortParams(7)} modifier="wrap" style={{ color: 'var(--pf-t--global--text--color--subtle)', fontWeight: 'var(--pf-t--global--font--weight--body--default)', fontSize: 'var(--pf-t--global--font--size--body--sm)', paddingTop: '0' }}>
                            Change
                          </Th>
                        </Tr>
                      </>
                    )}
                  </Thead>
                  <Tbody>
                    {data.map((item) => (
                      <Tr key={item.id}>
                        {activeView === 'projects' ? (
                          <>
                            <Td dataLabel="Project names">
                              <Link to={`/cost-management/optimizations/${item.id}`}>
                                {item.projectName}
                              </Link>
                            </Td>
                            <Td dataLabel="Project types">{item.workloadType}</Td>
                            <Td dataLabel="Cluster names">{item.clusterName}</Td>
                            <Td dataLabel="Memory - Current">{item.currentMemory || 'N/A'}</Td>
                            <Td dataLabel="Memory - Change">
                              {item.memoryChange !== null ? (
                                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                  <FlexItem>
                                    {item.memoryChange < 0 ? (
                                      <SortAmountDownIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
                                    ) : (
                                      <SortAmountUpIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                                    )}
                                  </FlexItem>
                                  <FlexItem>{item.memoryChange}%</FlexItem>
                                </Flex>
                              ) : 'N/A'}
                            </Td>
                            <Td dataLabel="CPU - Current">{item.currentCPU || '0%'}</Td>
                            <Td dataLabel="CPU - Change">
                              {item.cpuChange !== null ? (
                                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                  <FlexItem>
                                    {item.cpuChange < 0 ? (
                                      <SortAmountDownIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
                                    ) : (
                                      <SortAmountUpIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                                    )}
                                  </FlexItem>
                                  <FlexItem>+{item.cpuChange}%</FlexItem>
                                </Flex>
                              ) : 'N/A'}
                            </Td>
                            <Td dataLabel="Last reported">{item.lastReported}</Td>
                          </>
                        ) : (
                          <>
                            <Td dataLabel="Container names">
                              <Link to={`/cost-management/optimizations/${item.id}`}>
                                {item.workloadName}
                              </Link>
                            </Td>
                            <Td dataLabel="Workload names">{item.projectName}</Td>
                            <Td dataLabel="Workload types">{item.workloadType}</Td>
                            <Td dataLabel="Cluster names">{item.clusterName}</Td>
                            <Td dataLabel="Memory - Current">{item.currentMemory || 'N/A'}</Td>
                            <Td dataLabel="Memory - Change">
                              {item.memoryChange !== null ? (
                                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                  <FlexItem>
                                    {item.memoryChange < 0 ? (
                                      <SortAmountDownIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
                                    ) : (
                                      <SortAmountUpIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                                    )}
                                  </FlexItem>
                                  <FlexItem>{item.memoryChange}%</FlexItem>
                                </Flex>
                              ) : 'N/A'}
                            </Td>
                            <Td dataLabel="CPU - Current">{item.currentCPU || '0%'}</Td>
                            <Td dataLabel="CPU - Change">
                              {item.cpuChange !== null ? (
                                <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                                  <FlexItem>
                                    {item.cpuChange < 0 ? (
                                      <SortAmountDownIcon style={{ color: 'var(--pf-t--global--icon--color--status--danger--default)' }} />
                                    ) : (
                                      <SortAmountUpIcon style={{ color: 'var(--pf-t--global--icon--color--status--success--default)' }} />
                                    )}
                                  </FlexItem>
                                  <FlexItem>+{item.cpuChange}%</FlexItem>
                                </Flex>
                              ) : 'N/A'}
                            </Td>
                            <Td dataLabel="Last reported">{item.lastReported}</Td>
                          </>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

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
                  style={{ paddingTop: '0.5rem' }}
                />
              </FlexItem>
            </Flex>
          </>
        )}
      </PageSection>
    </>
  );
};

export default OptimizationsOverview;


