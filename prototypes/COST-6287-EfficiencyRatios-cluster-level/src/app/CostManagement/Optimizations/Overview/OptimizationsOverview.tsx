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
  MenuToggleElement,
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
  Modal,
  ModalVariant,
  Dropdown,
  DropdownList,
  DropdownItem,
  Divider,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
} from '@patternfly/react-core';
import { Table, Thead, Tr, Th, Tbody, Td, ThProps } from '@patternfly/react-table';
import { 
  OutlinedQuestionCircleIcon,
  FilterIcon, 
  ExportIcon,
  SortAmountDownIcon,
  TimesIcon,
  SortAmountUpIcon,
  EyeSlashIcon,
  EyeIcon,
  SaveIcon,
  EllipsisVIcon,
  CompressIcon,
  ExpandIcon,
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
  
  // Group by state
  const [groupByOpen, setGroupByOpen] = React.useState(false);
  const [groupBy, setGroupBy] = React.useState<'cluster' | 'project'>('cluster');
  const [groupBySelectionOpen, setGroupBySelectionOpen] = React.useState(false);
  const [selectedCluster, setSelectedCluster] = React.useState('all');
  const [selectedProject, setSelectedProject] = React.useState('all');
  const [groupBySearchValue, setGroupBySearchValue] = React.useState('');
  
  // Time range for Optimizations tab (table view)
  const [timeRangeOpen, setTimeRangeOpen] = React.useState(false);
  const [timeRange, setTimeRange] = React.useState('Last 30 days');

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

  // Timeline view state - global for all cards
  const [timelineView, setTimelineView] = React.useState('current');
  const [timeRangeSelectOpen, setTimeRangeSelectOpen] = React.useState(false);

  // Hover state for timeline charts
  const [hoveredPoints, setHoveredPoints] = React.useState<{
    usage: { index: number; x: number; y: number; date: string; time: string; value: number } | null;
    waste: { index: number; x: number; y: number; date: string; time: string; value: number } | null;
    cost: { index: number; x: number; y: number; date: string; time: string; value: number } | null;
    overhead: { index: number; x: number; y: number; date: string; time: string; value: number } | null;
  }>({
    usage: null,
    waste: null,
    cost: null,
    overhead: null
  });

  // Card layout management states
  const defaultCardLayout = {
    usage: { visible: true, size: 6, order: 0 },
    waste: { visible: true, size: 6, order: 1 },
    cost: { visible: true, size: 6, order: 2 },
    overhead: { visible: true, size: 6, order: 3 },
  };

  const [cardLayout, setCardLayout] = React.useState(() => {
    const saved = localStorage.getItem('efficiencyCardLayout');
    return saved ? JSON.parse(saved) : defaultCardLayout;
  });


  const [isLayoutModalOpen, setIsLayoutModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [tempCardLayout, setTempCardLayout] = React.useState(cardLayout);
  const [cardMenuOpen, setCardMenuOpen] = React.useState({
    usage: false,
    waste: false,
    cost: false,
    overhead: false,
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

  // Card layout management functions
  const enterEditMode = () => {
    setTempCardLayout(cardLayout);
    setIsEditMode(true);
  };

  const saveChanges = () => {
    setCardLayout(tempCardLayout);
    localStorage.setItem('efficiencyCardLayout', JSON.stringify(tempCardLayout));
    setIsEditMode(false);
  };

  const cancelChanges = () => {
    setTempCardLayout(cardLayout);
    setIsEditMode(false);
  };

  const resetLayout = () => {
    if (isEditMode) {
      setTempCardLayout(defaultCardLayout);
    } else {
      setCardLayout(defaultCardLayout);
      localStorage.removeItem('efficiencyCardLayout');
    }
  };

  const toggleCardVisibility = (cardKey: 'usage' | 'waste' | 'cost' | 'overhead') => {
    if (isEditMode) {
      setTempCardLayout(prev => ({
        ...prev,
        [cardKey]: {
          ...prev[cardKey],
          visible: !prev[cardKey].visible
        }
      }));
    }
  };

  const changeCardSize = (cardKey: 'usage' | 'waste' | 'cost' | 'overhead', size: number) => {
    if (isEditMode) {
      setTempCardLayout(prev => ({
        ...prev,
        [cardKey]: {
          ...prev[cardKey],
          size: size
        }
      }));
    }
  };

  const toggleCardMenu = (cardKey: 'usage' | 'waste' | 'cost' | 'overhead') => {
    setCardMenuOpen(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };


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
      idle: 900,
      totalClusterSpend: 120000,
      workerUnallocatedSpend: 25000,
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

  // Mock project data
  const allProjectsData = [
    {
      id: 'thanos',
      name: 'thanos',
      requestedCapacity: 800,
      usage: 600,
      idle: 200,
      totalClusterSpend: 35000,
      workerUnallocatedSpend: 5000,
      overheadCapacityCost: 3500,
      totalCapacityCost: 32000,
    },
    {
      id: 'cost-management',
      name: 'cost-management',
      requestedCapacity: 1200,
      usage: 900,
      idle: 300,
      totalClusterSpend: 55000,
      workerUnallocatedSpend: 8000,
      overheadCapacityCost: 5500,
      totalCapacityCost: 50000,
    },
    {
      id: 'monitoring',
      name: 'monitoring',
      requestedCapacity: 600,
      usage: 450,
      idle: 150,
      totalClusterSpend: 28000,
      workerUnallocatedSpend: 4000,
      overheadCapacityCost: 2800,
      totalCapacityCost: 25000,
    },
    {
      id: 'logging',
      name: 'logging',
      requestedCapacity: 900,
      usage: 1000,
      idle: -100, // Over-utilized
      totalClusterSpend: 42000,
      workerUnallocatedSpend: 6000,
      overheadCapacityCost: 4200,
      totalCapacityCost: 38000,
    }
  ];

  // Get current data based on grouping selection
  const getCurrentData = () => {
    if (groupBy === 'cluster') {
      if (selectedCluster === 'all') {
        return {
          name: 'All clusters',
          requestedCapacity: allClustersData.reduce((sum, c) => sum + c.requestedCapacity, 0),
          usage: allClustersData.reduce((sum, c) => sum + c.usage, 0),
          idle: allClustersData.reduce((sum, c) => sum + c.idle, 0),
          totalClusterSpend: allClustersData.reduce((sum, c) => sum + c.totalClusterSpend, 0),
          workerUnallocatedSpend: allClustersData.reduce((sum, c) => sum + c.workerUnallocatedSpend, 0),
          overheadCapacityCost: allClustersData.reduce((sum, c) => sum + c.overheadCapacityCost, 0),
          totalCapacityCost: allClustersData.reduce((sum, c) => sum + c.totalCapacityCost, 0),
        };
      }
      return allClustersData.find(c => c.id === selectedCluster) || allClustersData[0];
    } else {
      if (selectedProject === 'all') {
        return {
          name: 'All projects',
          requestedCapacity: allProjectsData.reduce((sum, p) => sum + p.requestedCapacity, 0),
          usage: allProjectsData.reduce((sum, p) => sum + p.usage, 0),
          idle: allProjectsData.reduce((sum, p) => sum + p.idle, 0),
          totalClusterSpend: allProjectsData.reduce((sum, p) => sum + p.totalClusterSpend, 0),
          workerUnallocatedSpend: allProjectsData.reduce((sum, p) => sum + p.workerUnallocatedSpend, 0),
          overheadCapacityCost: allProjectsData.reduce((sum, p) => sum + p.overheadCapacityCost, 0),
          totalCapacityCost: allProjectsData.reduce((sum, p) => sum + p.totalCapacityCost, 0),
        };
      }
      return allProjectsData.find(p => p.id === selectedProject) || allProjectsData[0];
    }
  };

  const clusterData = getCurrentData();

  // Calculate efficiency for each cluster to find worst performers
  const clusterEfficiencies = allClustersData.map(cluster => ({
    ...cluster,
    usageEff: Math.round(((cluster.requestedCapacity - cluster.idle) / cluster.requestedCapacity) * 100),
    wasteScore: Math.round((cluster.idle / cluster.requestedCapacity) * 100),
    costEff: Math.round(((cluster.totalClusterSpend - cluster.workerUnallocatedSpend) / cluster.totalClusterSpend) * 100),
    overheadEff: Math.round(((cluster.totalCapacityCost - cluster.overheadCapacityCost) / cluster.totalCapacityCost) * 100),
  }));

  // Calculate efficiency for each project to find worst performers
  const projectEfficiencies = allProjectsData.map(project => ({
    ...project,
    usageEff: Math.round(((project.requestedCapacity - project.idle) / project.requestedCapacity) * 100),
    wasteScore: Math.round((project.idle / project.requestedCapacity) * 100),
    costEff: Math.round(((project.totalClusterSpend - project.workerUnallocatedSpend) / project.totalClusterSpend) * 100),
    overheadEff: Math.round(((project.totalCapacityCost - project.overheadCapacityCost) / project.totalCapacityCost) * 100),
  }));

  // Get the current efficiencies based on grouping
  const currentEfficiencies = groupBy === 'cluster' ? clusterEfficiencies : projectEfficiencies;

  // Find worst performing items for each metric (sorted by worst first)
  const worstClusters = {
    usage: [...currentEfficiencies].sort((a, b) => a.usageEff - b.usageEff),
    waste: [...currentEfficiencies].sort((a, b) => b.wasteScore - a.wasteScore),
    cost: [...currentEfficiencies].sort((a, b) => a.costEff - b.costEff),
    overhead: [...currentEfficiencies].sort((a, b) => a.overheadEff - b.overheadEff),
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

  // Generate mock historical data for timeline views with seed for consistency
  const generateHistoricalData = (currentValue: number, timelineRange: string, betterDirection: string, seed: number) => {
    const dataPoints: { date: string; time: string; value: number }[] = [];
    let numPoints = 0;
    let startDate = new Date();

    // Simple seeded random function
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    // Determine date range based on selection
    const now = new Date();
    switch (timelineRange) {
      case 'month-to-date':
        numPoints = now.getDate(); // Days in current month so far
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'previous-month':
        numPoints = new Date(now.getFullYear(), now.getMonth(), 0).getDate(); // Days in previous month
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'previous-and-month-to-date':
        numPoints = new Date(now.getFullYear(), now.getMonth(), 0).getDate() + now.getDate(); // Previous month + current month to date
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'last-30-days':
        numPoints = 30;
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'last-60-days':
        numPoints = 60;
        startDate.setDate(startDate.getDate() - 60);
        break;
      case 'last-90-days':
        numPoints = 90;
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'custom':
      default:
        numPoints = 30; // Default to 30 days
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    // Limit data points for readability (max ~30 points)
    const step = Math.max(1, Math.floor(numPoints / 30));
    const actualPoints = Math.ceil(numPoints / step);

    // Generate trend with some randomness
    const startValue = currentValue - (seededRandom(seed) * 20 - 10); // Start within ±10 of current
    const trend = (currentValue - startValue) / actualPoints; // Linear trend towards current value

    for (let i = 0; i < actualPoints; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (i * step));

      // Random time for each point using seed
      const randomHour = Math.floor(seededRandom(seed + i) * 24);
      const randomMinute = Math.floor(seededRandom(seed + i + 1000) * 60);
      date.setHours(randomHour, randomMinute, 0, 0);

      const baseValue = startValue + (trend * i);
      const noise = (seededRandom(seed + i + 2000) - 0.5) * 8; // Add some volatility
      const value = Math.max(0, Math.min(100, baseValue + noise));

      dataPoints.push({
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        value: Math.round(value)
      });
    }

    // Ensure last point is the current value with current time
    const currentTime = new Date();
    dataPoints.push({
      date: currentTime.toISOString().split('T')[0],
      time: currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      value: currentValue
    });

    return dataPoints;
  };

  // Calculate gauge colors based on value - optimal range is 80-120%
  const getGaugeColor = (value: number) => {
    if (value < 60) return '#C9190B'; // Red - severely under-utilized
    if (value < 80) return '#F0AB00'; // Orange - under-utilized
    if (value <= 120) return '#3E8635'; // Green - optimal
    if (value <= 160) return '#F0AB00'; // Orange - over-utilized
    return '#C9190B'; // Red - severely over-utilized
  };

  const getGaugeStatus = (value: number) => {
    if (value < 60) return 'Under-utilized';
    if (value < 80) return 'Below optimal';
    if (value <= 120) return 'Optimal';
    if (value <= 160) return 'Above optimal';
    return 'Over-utilized';
  };

  // Render timeline chart view (Garmin-style)
  const renderTimelineChart = (efficiency: any, formulaKey: 'usage' | 'waste' | 'cost' | 'overhead', timelineRange: string) => {
    const currentValue = efficiency.value;
    
    // Use formulaKey as seed to ensure consistent data per metric
    const seedMap = { usage: 1000, waste: 2000, cost: 3000, overhead: 4000 };
    const seed = seedMap[formulaKey];
    
    // Generate data with seed for consistency (no need for useMemo since we have seeded random)
    const historicalData = generateHistoricalData(currentValue, timelineRange, efficiency.betterDirection, seed);
    
    const startValue = historicalData[0].value;
    const changeValue = currentValue - startValue;
    const changePercent = startValue !== 0 ? ((changeValue / startValue) * 100).toFixed(1) : '0';
    const isPositiveChange = changeValue > 0;
    const isGoodChange = efficiency.betterDirection === 'higher' ? isPositiveChange : !isPositiveChange;

    // Get hover state for this specific card
    const hoveredPoint = hoveredPoints[formulaKey];

    // Chart dimensions
    const chartWidth = 400;
    const chartHeight = 150;
    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // Scale data points
    const xScale = (index: number) => padding.left + (index / (historicalData.length - 1)) * innerWidth;
    const yScale = (value: number) => padding.top + ((100 - value) / 100) * innerHeight;

    // Generate path for line chart
    const linePath = historicalData
      .map((point, index) => {
        const x = xScale(index);
        const y = yScale(point.value);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');

    // Target range background
    const targetRangeY1 = efficiency.betterDirection === 'higher' ? yScale(100) : yScale(20);
    const targetRangeY2 = efficiency.betterDirection === 'higher' ? yScale(80) : yScale(0);

    // Format date as DD/MM/YYYY
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Handle mouse move over chart
    const handleChartMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
      // Get the SVG element (parent of the rect)
      const svg = event.currentTarget.ownerSVGElement;
      if (!svg) return;
      
      const svgRect = svg.getBoundingClientRect();
      const mouseX = event.clientX - svgRect.left;
      
      // Find closest data point
      let closestIndex = 0;
      let minDistance = Infinity;
      
      historicalData.forEach((point, index) => {
        const pointX = xScale(index);
        const distance = Math.abs(mouseX - pointX);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      const point = historicalData[closestIndex];
      setHoveredPoints(prev => ({
        ...prev,
        [formulaKey]: {
          index: closestIndex,
          x: xScale(closestIndex),
          y: yScale(point.value),
          date: point.date,
          time: point.time,
          value: point.value
        }
      }));
    };

    const handleChartMouseLeave = () => {
      setHoveredPoints(prev => ({
        ...prev,
        [formulaKey]: null
      }));
    };

    // Display value - use hovered value if hovering, otherwise current value
    const displayValue = hoveredPoint ? hoveredPoint.value : currentValue;
    const displayDate = hoveredPoint ? hoveredPoint.date : new Date().toISOString().split('T')[0];
    const displayTime = hoveredPoint ? hoveredPoint.time : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
      <div style={{ padding: '1rem 0', position: 'relative' }}>
                <svg width={chartWidth} height={chartHeight}>
                  {/* Target range background */}
                  <rect
                    x={padding.left}
                    y={Math.min(targetRangeY1, targetRangeY2)}
                    width={innerWidth}
                    height={Math.abs(targetRangeY2 - targetRangeY1)}
                    fill="#3E8635"
                    opacity="0.1"
                  />

                  {/* Grid lines */}
                  <line x1={padding.left} y1={yScale(0)} x2={padding.left + innerWidth} y2={yScale(0)} stroke="#d2d2d2" strokeWidth="1" />
                  <line x1={padding.left} y1={yScale(50)} x2={padding.left + innerWidth} y2={yScale(50)} stroke="#f0f0f0" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1={padding.left} y1={yScale(100)} x2={padding.left + innerWidth} y2={yScale(100)} stroke="#d2d2d2" strokeWidth="1" />

                  {/* Line path */}
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#0066cc"
                    strokeWidth="2"
                  />

                  {/* Data points (dots) - only show when value changes */}
                  {historicalData.map((point, index) => {
                    // Show dot if it's the first point, last point, or value changed from previous point
                    const showDot = index === 0 || 
                                    index === historicalData.length - 1 || 
                                    (index > 0 && point.value !== historicalData[index - 1].value);
                    
                    if (!showDot) return null;

                    return (
                      <circle
                        key={index}
                        cx={xScale(index)}
                        cy={yScale(point.value)}
                        r="4"
                        fill="#0066cc"
                        stroke="#fff"
                        strokeWidth="2"
                      />
                    );
                  })}

                  {/* Hover indicator */}
                  {hoveredPoint && (
                    <>
                      {/* Vertical line */}
                      <line
                        x1={hoveredPoint.x}
                        y1={padding.top}
                        x2={hoveredPoint.x}
                        y2={chartHeight - padding.bottom}
                        stroke="#0066cc"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                      />
                      {/* Highlighted dot */}
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="6"
                        fill="#0066cc"
                        stroke="#fff"
                        strokeWidth="3"
                      />
                    </>
                  )}

                  {/* Interactive overlay */}
                  <rect
                    x={padding.left}
                    y={padding.top}
                    width={innerWidth}
                    height={innerHeight}
                    fill="transparent"
                    style={{ cursor: 'crosshair' }}
                    onMouseMove={handleChartMouseMove}
                    onMouseLeave={handleChartMouseLeave}
                  />

                  {/* Y-axis labels - 100% at top, 0% at bottom */}
                  <text x={padding.left - 10} y={yScale(100)} fontSize="11" fill="#6a6e73" textAnchor="end" dominantBaseline="middle">100%</text>
                  <text x={padding.left - 10} y={yScale(50)} fontSize="11" fill="#6a6e73" textAnchor="end" dominantBaseline="middle">50%</text>
                  <text x={padding.left - 10} y={yScale(0)} fontSize="11" fill="#6a6e73" textAnchor="end" dominantBaseline="middle">0%</text>

                  {/* X-axis labels */}
                  <text x={padding.left} y={chartHeight - 5} fontSize="11" fill="#6a6e73" textAnchor="start">
                    {formatDate(historicalData[0].date)}
                  </text>
                  <text x={padding.left + innerWidth} y={chartHeight - 5} fontSize="11" fill="#6a6e73" textAnchor="end">
                    {formatDate(historicalData[historicalData.length - 1].date)}
                  </text>
                </svg>

                {/* Tooltip on hover */}
                {hoveredPoint && (
                  <div style={{
                    position: 'absolute',
                    left: `${hoveredPoint.x + 15}px`,
                    top: `${hoveredPoint.y - 50}px`,
                    background: '#151515',
                    color: '#fff',
                    padding: '12px 18px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    zIndex: 10,
                    minWidth: '160px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>{hoveredPoint.value}%</div>
                    <div style={{ 
                      color: getGaugeColor(hoveredPoint.value),
                      fontWeight: 600,
                      marginBottom: '6px',
                      fontSize: '13px'
                    }}>
                      {getGaugeStatus(hoveredPoint.value)}
                    </div>
                    <div style={{ fontSize: '11px', color: '#d2d2d2' }}>
                      {formatDate(hoveredPoint.date)} {hoveredPoint.time}
                    </div>
                  </div>
                )}
              </div>
    );
  };

  const renderGauge = (efficiency: any, formulaKey: 'usage' | 'waste' | 'cost' | 'overhead', recommendations: { short: string[]; detailed: string[] }, worstClustersList?: any[]) => {
    const percentage = efficiency.value;
    // Scale is 0-200%, so needle rotation = (value / 200) * 180 degrees
    const rotation = Math.min((percentage / 200) * 180, 180); // Cap at 180 degrees (200%)
    const color = getGaugeColor(percentage);
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
      <Card 
        style={{ 
          height: '100%', 
          background: 'white', 
          border: '1px solid #d2d2d2'
        }}
      >
        <CardBody>
          {/* Header (full width) */}
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
            <FlexItem>
              <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
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
                            <div style={{ color: '#6a6e73', marginBottom: '0.75rem', fontSize: '13px' }}>
                              {efficiency.description}
                            </div>
                            
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
                {isEditMode && (
                  <FlexItem>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                      <FlexItem>
                        <Dropdown
                          isOpen={cardMenuOpen[formulaKey] || false}
                          onOpenChange={(isOpen) => setCardMenuOpen(prev => ({ ...prev, [formulaKey]: isOpen }))}
                          popperProps={{ position: 'right' }}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              aria-label="Resize card"
                              variant="plain"
                              onClick={() => toggleCardMenu(formulaKey)}
                              isExpanded={cardMenuOpen[formulaKey] || false}
                            >
                              <ExpandIcon />
                            </MenuToggle>
                          )}
                        >
                          <DropdownList>
                            <DropdownItem key="small" onClick={() => changeCardSize(formulaKey, 3)}>
                              Small (25%)
                            </DropdownItem>
                            <DropdownItem key="medium" onClick={() => changeCardSize(formulaKey, 6)}>
                              Medium (50%)
                            </DropdownItem>
                            <DropdownItem key="large" onClick={() => changeCardSize(formulaKey, 12)}>
                              Large (100%)
                            </DropdownItem>
                          </DropdownList>
                        </Dropdown>
                      </FlexItem>
                      <FlexItem>
                        <Dropdown
                          isOpen={cardMenuOpen[`${formulaKey}-kebab`] || false}
                          onOpenChange={(isOpen) => setCardMenuOpen(prev => ({ ...prev, [`${formulaKey}-kebab`]: isOpen }))}
                          popperProps={{ position: 'right' }}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              aria-label="Card options"
                              variant="plain"
                              onClick={() => {
                                setCardMenuOpen(prev => ({ ...prev, [`${formulaKey}-kebab`]: !prev[`${formulaKey}-kebab`] }));
                              }}
                              isExpanded={cardMenuOpen[`${formulaKey}-kebab`] || false}
                            >
                              <EllipsisVIcon />
                            </MenuToggle>
                          )}
                        >
                          <DropdownList>
                            <DropdownItem key="hide" onClick={() => toggleCardVisibility(formulaKey)}>
                              <EyeSlashIcon /> Hide card
                            </DropdownItem>
                          </DropdownList>
                        </Dropdown>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                )}
              </Flex>
            </FlexItem>

            {/* Main content: Chart on left, Recommendations + Top 3 on right */}
            <FlexItem>
              {timelineView === 'current' ? (
                <Grid hasGutter>
                  {/* Left side: Gauge Chart */}
                  <GridItem span={4}>
                  <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ height: '100%' }}>
                    <FlexItem style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '200px', height: '120px' }}>
                          {/* Background arc - 0-200% scale with green in middle */}
                          <svg width="200" height="120" style={{ position: 'absolute', top: 0, left: 0 }}>
                            {/* Red segment (0-60%) - Under-utilized */}
                            <path
                              d="M 20 100 A 80 80 0 0 1 53 35"
                              fill="none"
                              stroke="#C9190B"
                              strokeWidth="14"
                            />
                            {/* Orange segment (60-80%) - Below optimal */}
                            <path
                              d="M 53 35 A 80 80 0 0 1 75.3 24"
                              fill="none"
                              stroke="#F0AB00"
                              strokeWidth="14"
                            />
                            {/* Green segment (80-120%) - Optimal */}
                            <path
                              d="M 75.3 24 A 80 80 0 0 1 124.7 24"
                              fill="none"
                              stroke="#3E8635"
                              strokeWidth="14"
                            />
                            {/* Orange segment (120-160%) - Above optimal */}
                            <path
                              d="M 124.7 24 A 80 80 0 0 1 147 35"
                              fill="none"
                              stroke="#F0AB00"
                              strokeWidth="14"
                            />
                            {/* Red segment (160-200%) - Over-utilized */}
                            <path
                              d="M 147 35 A 80 80 0 0 1 180 100"
                              fill="none"
                              stroke="#C9190B"
                              strokeWidth="14"
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

                          {/* Status label below gauge dot */}
                          <div style={{ 
                            position: 'absolute',
                            top: '104px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center',
                            fontSize: '12px',
                            lineHeight: '1.3',
                            whiteSpace: 'nowrap'
                          }}>
                            <div style={{ 
                              color: color,
                              fontWeight: 600 
                            }}>
                              {getGaugeStatus(percentage)}
                            </div>
                            <div style={{ 
                              color: '#6a6e73',
                              fontSize: '11px'
                            }}>
                              (Target: 80-120%)
                            </div>
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
                          
                          {/* 200% aligned with arc end */}
                          <div style={{ 
                            position: 'absolute',
                            right: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#151515'
                          }}>
                            200%
                          </div>
                        </div>
                      </div>
                    </FlexItem>
                  </Flex>
                </GridItem>

                {/* Right side: Top 3 + Recommendations */}
                <GridItem span={8}>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
                    {/* Top 3 clusters/projects (only show in Overall view) */}
                    {((groupBy === 'cluster' && selectedCluster === 'all') || (groupBy === 'project' && selectedProject === 'all')) && worstClustersList && worstClustersList!.length > 0 && (
                      <FlexItem>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                          <FlexItem>
                            <div style={{ color: '#151515', marginBottom: '0.5rem', fontSize: '13px', fontWeight: 600 }}>
                              Top 3 {groupBy === 'cluster' ? 'clusters' : 'projects'} affecting this metric
                            </div>
                          </FlexItem>
                          
                          {/* Compact table-like structure */}
                          <FlexItem>
                            <div style={{ 
                              fontSize: '12px',
                              borderBottom: '1px solid #d2d2d2'
                            }}>
                              {(showAll ? worstClustersList! : worstClustersList!.slice(0, 3)).map((cluster, index) => (
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
                                    <span style={{ color: '#6a6e73', marginRight: '0.5rem', fontSize: '11px' }}>{index + 1}.</span>
                                    <Link to={groupBy === 'cluster' ? `/cost-management/openshift/cluster/${cluster.id}` : `/cost-management/optimizations/${cluster.id}`} style={{ color: '#0066cc', textDecoration: 'none' }}>
                                      {cluster.name}
                                    </Link>
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
                          {worstClustersList!.length > 3 && (
                            <FlexItem style={{ marginTop: '0.5rem' }}>
                              <Button 
                                variant="link" 
                                onClick={toggleFactors}
                                style={{ padding: 0, fontSize: '12px', color: '#0066cc' }}
                              >
                                {showAll ? '− Show less' : `+ See ${worstClustersList!.length - 3} more`}
                              </Button>
                            </FlexItem>
                          )}
                        </Flex>
                      </FlexItem>
                    )}

                    {/* Recommendations */}
                    <FlexItem>
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
                  </Flex>
                </GridItem>
              </Grid>
              ) : (
                // Timeline view (Garmin-style) - with gauge and chart
                <Grid hasGutter>
                  {/* Left side: Gauge Chart (same as current view) */}
                  <GridItem span={4}>
                    <Flex direction={{ default: 'column' }} alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentCenter' }} style={{ height: '100%' }}>
                      <FlexItem style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ position: 'relative', width: '200px', height: '120px' }}>
                            {/* Background arc */}
                            <svg width="200" height="120" style={{ position: 'absolute', top: 0, left: 0 }}>
                              {/* Red segment (0-60%) - Under-utilized */}
                              <path
                                d="M 20 100 A 80 80 0 0 1 53 35"
                                fill="none"
                                stroke="#C9190B"
                                strokeWidth="14"
                              />
                              {/* Orange segment (60-80%) - Below optimal */}
                              <path
                                d="M 53 35 A 80 80 0 0 1 75.3 24"
                                fill="none"
                                stroke="#F0AB00"
                                strokeWidth="14"
                              />
                              {/* Green segment (80-120%) - Optimal */}
                              <path
                                d="M 75.3 24 A 80 80 0 0 1 124.7 24"
                                fill="none"
                                stroke="#3E8635"
                                strokeWidth="14"
                              />
                              {/* Orange segment (120-160%) - Above optimal */}
                              <path
                                d="M 124.7 24 A 80 80 0 0 1 147 35"
                                fill="none"
                                stroke="#F0AB00"
                                strokeWidth="14"
                              />
                              {/* Red segment (160-200%) - Over-utilized */}
                              <path
                                d="M 147 35 A 80 80 0 0 1 180 100"
                                fill="none"
                                stroke="#C9190B"
                                strokeWidth="14"
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

                            {/* Status label below gauge dot */}
                            <div style={{ 
                              position: 'absolute',
                              top: '104px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              textAlign: 'center',
                              fontSize: '12px',
                              lineHeight: '1.3',
                              whiteSpace: 'nowrap'
                            }}>
                              <div style={{ 
                                color: color,
                                fontWeight: 600 
                              }}>
                                {getGaugeStatus(percentage)}
                              </div>
                              <div style={{ 
                                color: '#6a6e73',
                                fontSize: '11px'
                              }}>
                                (Target: 80-120%)
                              </div>
                            </div>
                          </div>
                          
                          {/* Labels below chart */}
                          <div style={{ 
                            position: 'relative',
                            width: '200px',
                            marginTop: '0.5rem',
                            height: '20px'
                          }}>
                            <div style={{ 
                              position: 'absolute',
                              left: '14px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#151515'
                            }}>
                              0%
                            </div>
                            <div style={{ 
                              position: 'absolute',
                              right: '8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#151515'
                            }}>
                              200%
                            </div>
                          </div>
                        </div>
                      </FlexItem>
                    </Flex>
                  </GridItem>

                  {/* Right side: Timeline Chart */}
                  <GridItem span={8}>
                    {renderTimelineChart(efficiency, formulaKey, timelineView)}
                  </GridItem>
                </Grid>
              )}
            </FlexItem>
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
          <Tab eventKey={1} title={<TabTitleText>Optimizations</TabTitleText>} isDisabled />
        </Tabs>
      </PageSection>

      {/* Main Content */}
      <PageSection>
        {activeTabKey === 0 && (
          <>
            {/* Cluster and Time Range Selectors */}
            <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ marginBottom: '1rem' }}>
              <FlexItem>
                <Flex alignItems={{ default: 'alignItemsCenter' }}>
                  {/* Group by Selector */}
                  <FlexItem>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <span style={{ fontSize: '14px', color: '#151515', fontWeight: 600 }}>
                          Group by:
                        </span>
                      </FlexItem>
                      <FlexItem>
                        <Select
                          isOpen={groupByOpen}
                          onSelect={(_event, value) => {
                            setGroupBy(value as 'cluster' | 'project');
                            setGroupByOpen(false);
                          }}
                          onOpenChange={(isOpen) => setGroupByOpen(isOpen)}
                          selected={groupBy}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setGroupByOpen(!groupByOpen)}
                              isExpanded={groupByOpen}
                              style={{ minWidth: '120px' }}
                            >
                              {groupBy === 'cluster' ? 'Cluster' : 'Project'}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="cluster">Cluster</SelectOption>
                            <SelectOption value="project">Project</SelectOption>
                          </SelectList>
                        </Select>
                      </FlexItem>
                      <FlexItem>
                        <Select
                          isOpen={groupBySelectionOpen}
                          onSelect={(_event, value) => {
                            if (groupBy === 'cluster') {
                              setSelectedCluster(value as string);
                            } else {
                              setSelectedProject(value as string);
                            }
                            setGroupBySelectionOpen(false);
                            setGroupBySearchValue('');
                          }}
                          onOpenChange={(isOpen) => {
                            setGroupBySelectionOpen(isOpen);
                            if (!isOpen) {
                              setGroupBySearchValue('');
                            }
                          }}
                          selected={groupBy === 'cluster' ? selectedCluster : selectedProject}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              variant="typeahead"
                              onClick={() => setGroupBySelectionOpen(!groupBySelectionOpen)}
                              isExpanded={groupBySelectionOpen}
                              isFullWidth
                              style={{ minWidth: '250px' }}
                            >
                              <TextInputGroup isPlain>
                                <TextInputGroupMain
                                  value={groupBySelectionOpen ? groupBySearchValue : (
                                    groupBy === 'cluster' 
                                      ? (selectedCluster === 'all' ? 'All clusters' : clusterData.name)
                                      : (selectedProject === 'all' ? 'All projects' : clusterData.name)
                                  )}
                                  onClick={() => setGroupBySelectionOpen(true)}
                                  onChange={(_event, value) => {
                                    setGroupBySearchValue(value);
                                    if (!groupBySelectionOpen) {
                                      setGroupBySelectionOpen(true);
                                    }
                                  }}
                                  autoComplete="off"
                                  placeholder={`Search ${groupBy === 'cluster' ? 'clusters' : 'projects'}...`}
                                />
                                {groupBySearchValue && (
                                  <TextInputGroupUtilities>
                                    <Button
                                      variant="plain"
                                      onClick={() => {
                                        setGroupBySearchValue('');
                                      }}
                                      aria-label="Clear search"
                                    >
                                      <TimesIcon />
                                    </Button>
                                  </TextInputGroupUtilities>
                                )}
                              </TextInputGroup>
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            {groupBy === 'cluster' ? (
                              <>
                                {(!groupBySearchValue || 'all clusters'.includes(groupBySearchValue.toLowerCase())) && (
                                  <SelectOption value="all">All clusters</SelectOption>
                                )}
                                {allClustersData
                                  .filter(cluster => !groupBySearchValue || cluster.name.toLowerCase().includes(groupBySearchValue.toLowerCase()))
                                  .map(cluster => (
                                    <SelectOption key={cluster.id} value={cluster.id}>
                                      {cluster.name}
                                    </SelectOption>
                                  ))}
                              </>
                            ) : (
                              <>
                                {(!groupBySearchValue || 'all projects'.includes(groupBySearchValue.toLowerCase())) && (
                                  <SelectOption value="all">All projects</SelectOption>
                                )}
                                {allProjectsData
                                  .filter(project => !groupBySearchValue || project.name.toLowerCase().includes(groupBySearchValue.toLowerCase()))
                                  .map(project => (
                                    <SelectOption key={project.id} value={project.id}>
                                      {project.name}
                                    </SelectOption>
                                  ))}
                              </>
                            )}
                          </SelectList>
                        </Select>
                      </FlexItem>
                    </Flex>
                  </FlexItem>

                  {/* Time Range Selector - 24px spacing */}
                  <FlexItem style={{ marginLeft: '24px' }}>
                    <Flex spaceItems={{ default: 'spaceItemsSm' }} alignItems={{ default: 'alignItemsCenter' }}>
                      <FlexItem>
                        <span style={{ fontSize: '14px', color: '#151515', fontWeight: 600 }}>
                          Select time range:
                        </span>
                      </FlexItem>
                      <FlexItem>
                        <Select
                          isOpen={timeRangeSelectOpen}
                          onSelect={(_event, value) => {
                            setTimelineView(value as string);
                            setTimeRangeSelectOpen(false);
                          }}
                          onOpenChange={(isOpen) => setTimeRangeSelectOpen(isOpen)}
                          selected={timelineView}
                          toggle={(toggleRef) => (
                            <MenuToggle
                              ref={toggleRef}
                              onClick={() => setTimeRangeSelectOpen(!timeRangeSelectOpen)}
                              isExpanded={timeRangeSelectOpen}
                              style={{ minWidth: '220px' }}
                            >
                              {timelineView === 'current' ? 'Current' :
                               timelineView === 'month-to-date' ? 'Month to date' :
                               timelineView === 'previous-month' ? 'Previous month' :
                               timelineView === 'previous-and-month-to-date' ? 'Previous month and month to date' :
                               timelineView === 'last-30-days' ? 'Last 30 days' :
                               timelineView === 'last-60-days' ? 'Last 60 days' :
                               timelineView === 'last-90-days' ? 'Last 90 days' :
                               timelineView === 'custom' ? 'Custom time range' :
                               'Current'}
                            </MenuToggle>
                          )}
                        >
                          <SelectList>
                            <SelectOption value="current">Current</SelectOption>
                            <SelectOption value="month-to-date">Month to date</SelectOption>
                            <SelectOption value="previous-month">Previous month</SelectOption>
                            <SelectOption value="previous-and-month-to-date">Previous month and month to date</SelectOption>
                            <SelectOption value="last-30-days">Last 30 days</SelectOption>
                            <SelectOption value="last-60-days">Last 60 days</SelectOption>
                            <SelectOption value="last-90-days">Last 90 days</SelectOption>
                            <SelectOption value="custom">Custom time range</SelectOption>
                          </SelectList>
                        </Select>
                      </FlexItem>
                      <FlexItem>
                        <span style={{ fontSize: '13px', color: '#6a6e73' }}>
                          ({(() => {
                            const now = new Date();
                            const formatDate = (d: Date) => {
                              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                              return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
                            };
                            
                            if (timelineView === 'current') {
                              return `Calculated: ${formatDate(now)} at ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
                            }
                            
                            let startDate: Date;
                            let endDate = now;
                            
                            switch (timelineView) {
                              case 'month-to-date':
                                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                                break;
                              case 'previous-month':
                                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                endDate = new Date(now.getFullYear(), now.getMonth(), 0);
                                break;
                              case 'previous-and-month-to-date':
                                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                break;
                              case 'last-30-days':
                                startDate = new Date(now);
                                startDate.setDate(startDate.getDate() - 30);
                                break;
                              case 'last-60-days':
                                startDate = new Date(now);
                                startDate.setDate(startDate.getDate() - 60);
                                break;
                              case 'last-90-days':
                                startDate = new Date(now);
                                startDate.setDate(startDate.getDate() - 90);
                                break;
                              case 'custom':
                              default:
                                startDate = new Date(now);
                                startDate.setDate(startDate.getDate() - 30);
                                break;
                            }
                            
                            return `${formatDate(startDate)} - ${formatDate(endDate)}`;
                          })()})
                        </span>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </FlexItem>

              {/* Layout Management Buttons */}
              <FlexItem>
                    <Button 
                      variant="secondary" 
                      onClick={enterEditMode}
                      style={{ display: isEditMode ? 'none' : 'block' }}
                    >
                      Edit
                    </Button>
              </FlexItem>
            </Flex>

            {/* Edit Mode Options Panel */}
            {isEditMode && (
              <Card style={{ background: '#e7f1fa', border: '1px solid #73bcf7' }}>
                <CardBody>
                  <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsLg' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#151515' }}>
                            Edit mode:
                          </span>
                        </FlexItem>
                        <FlexItem>
                          <Button 
                            variant="link" 
                            onClick={() => setIsLayoutModalOpen(true)}
                            style={{ color: '#0066cc' }}
                          >
                            Hide cards
                          </Button>
                        </FlexItem>
                        <FlexItem>
                          <Button 
                            variant="link" 
                            onClick={resetLayout}
                            style={{ color: '#0066cc' }}
                          >
                            Reset to default
                          </Button>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                    <FlexItem>
                      <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                        <FlexItem>
                          <Button 
                            variant="primary" 
                            onClick={saveChanges}
                          >
                            Save
                          </Button>
                        </FlexItem>
                        <FlexItem>
                          <Button 
                            variant="secondary" 
                            onClick={cancelChanges}
                          >
                            Cancel
                          </Button>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  </Flex>
                </CardBody>
              </Card>
            )}

            {/* Efficiency Gauges - Dynamic Layout Based on Card Settings */}
            <Grid hasGutter>
              {(() => {
                const currentLayout = isEditMode ? tempCardLayout : cardLayout;
                return Object.entries(currentLayout)
                  .filter(([_, card]: [string, any]) => card.visible)
                  .sort(([, a]: [string, any], [, b]: [string, any]) => a.order - b.order)
                  .map(([cardKey]) => {
                    const cardData = {
                      usage: { efficiency: usageEfficiency, recommendations: { short: ['Review container requests in Optimizations tab', 'Right-size based on actual usage'], detailed: [] }, worstClusters: worstClusters.usage },
                      waste: { efficiency: wasteScore, recommendations: { short: ['Reduce idle capacity', 'Right-size container requests'], detailed: [] }, worstClusters: worstClusters.waste },
                      cost: { efficiency: costEfficiency, recommendations: { short: ['Review unallocated costs', 'Optimize resource requests'], detailed: [] }, worstClusters: worstClusters.cost },
                      overhead: { efficiency: overheadScore, recommendations: { short: ['Review platform overhead costs', 'Optimize cluster sizing'], detailed: [] }, worstClusters: worstClusters.overhead },
                    }[cardKey];
                    
                    if (!cardData) return null;
                    
                    return (
                      <GridItem 
                        key={cardKey}
                        span={currentLayout[cardKey].size as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}
                      >
                        {renderGauge(cardData.efficiency, cardKey as 'usage' | 'waste' | 'cost' | 'overhead', cardData.recommendations, cardData.worstClusters)}
                      </GridItem>
                    );
                  });
              })()}
            </Grid>

            {/* Manage Cards Modal */}
            <Modal
              variant={ModalVariant.small}
              title="Show or hide cards"
              isOpen={isLayoutModalOpen}
              onClose={() => setIsLayoutModalOpen(false)}
            >
              <div style={{ padding: '24px' }}>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                  <FlexItem>
                    <p style={{ color: '#6a6e73', fontSize: '14px' }}>
                      Toggle visibility for each efficiency metric card.
                    </p>
                  </FlexItem>
                  
                  {[
                    { key: 'usage' as const, label: 'Usage efficiency' },
                    { key: 'waste' as const, label: 'Waste score' },
                    { key: 'cost' as const, label: 'Cost efficiency' },
                    { key: 'overhead' as const, label: 'Overhead score' },
                  ].map(card => (
                    <FlexItem key={card.key}>
                      <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }} style={{ padding: '0.5rem 0', borderBottom: '1px solid #f0f0f0' }}>
                        <FlexItem>
                          <span style={{ fontSize: '14px', fontWeight: 600 }}>{card.label}</span>
                        </FlexItem>
                        <FlexItem>
                          <Button
                            variant={tempCardLayout[card.key].visible ? 'secondary' : 'primary'}
                            icon={tempCardLayout[card.key].visible ? <EyeSlashIcon /> : <EyeIcon />}
                            onClick={() => toggleCardVisibility(card.key)}
                            size="sm"
                          >
                            {tempCardLayout[card.key].visible ? 'Hide' : 'Show'}
                          </Button>
                        </FlexItem>
                      </Flex>
                    </FlexItem>
                  ))}
                  
                  <FlexItem style={{ marginTop: '1rem', textAlign: 'right' }}>
                    <Button variant="primary" onClick={() => setIsLayoutModalOpen(false)}>
                      Done
                    </Button>
                  </FlexItem>
                </Flex>
              </div>
            </Modal>

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


