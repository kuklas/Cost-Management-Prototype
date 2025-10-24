import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import { OpenShift } from '@app/OpenShift/OpenShift';
import { Overview } from '@app/CostManagement/Overview/Overview';
import { Optimizations } from '@app/CostManagement/Optimizations/Optimizations';
import { CostManagementOpenShift } from '@app/CostManagement/OpenShift/CostManagementOpenShift';
import { ClusterDetail } from '@app/CostManagement/OpenShift/ClusterDetail/ClusterDetail';
import NodeDetail from '@app/CostManagement/OpenShift/NodeDetail/NodeDetail';
import { AWS } from '@app/CostManagement/AWS/AWS';
import { GCP } from '@app/CostManagement/GCP/GCP';
import { GCPAccountDetails } from '@app/CostManagement/GCP/GCPAccountDetails';
import { Azure } from '@app/CostManagement/Azure/Azure';
import { CostExplorer } from '@app/CostManagement/CostExplorer/CostExplorer';
import { CostManagementSettings } from '@app/CostManagement/Settings/CostManagementSettings';
import { NotFound } from '@app/NotFound/NotFound';

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  element: React.ReactElement;
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <OpenShift />,
    exact: true,
    label: 'OpenShift',
    path: '/',
    title: 'Cost Management | OpenShift',
  },
  {
    label: 'Cost management',
    routes: [
      {
        element: <Overview />,
        exact: true,
        label: 'Overview',
        path: '/cost-management/overview',
        title: 'Cost Management | Overview',
      },
      {
        element: <Optimizations />,
        exact: true,
        label: 'Optimizations',
        path: '/cost-management/optimizations',
        title: 'Cost Management | Optimizations',
      },
      {
        element: <CostManagementOpenShift />,
        exact: true,
        label: 'OpenShift',
        path: '/cost-management/openshift',
        title: 'Cost Management | OpenShift',
      },
      {
        element: <ClusterDetail />,
        exact: true,
        path: '/cost-management/openshift/cluster/:clusterId',
        title: 'Cost Management | Cluster Details',
      },
      {
        element: <NodeDetail />,
        exact: true,
        path: '/cost-management/openshift/node/:nodeId',
        title: 'Cost Management | Node Details',
      },
      {
        element: <AWS />,
        exact: true,
        label: 'Amazon Web Services',
        path: '/cost-management/aws',
        title: 'Cost Management | Amazon Web Services',
      },
      {
        element: <GCP />,
        exact: true,
        label: 'Google Cloud',
        path: '/cost-management/gcp',
        title: 'Cost Management | Google Cloud',
      },
      {
        element: <GCPAccountDetails />,
        exact: true,
        path: '/cost-management/gcp/account-details/:accountId',
        title: 'Cost Management | Google Cloud Account Details',
      },
      {
        element: <Azure />,
        exact: true,
        label: 'Microsoft Azure',
        path: '/cost-management/azure',
        title: 'Cost Management | Microsoft Azure',
      },
      {
        element: <CostExplorer />,
        exact: true,
        label: 'Cost Explorer',
        path: '/cost-management/explorer',
        title: 'Cost Management | Cost Explorer',
      },
      {
        element: <CostManagementSettings />,
        exact: true,
        label: 'Settings',
        path: '/cost-management/settings',
        title: 'Cost Management | Settings',
      },
    ],
  },
];

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };
