import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Button,
  Masthead,
  MastheadBrand,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  Page,
  PageSidebar,
  PageSidebarBody,
  SkipToContent,
  Label,
} from '@patternfly/react-core';
import { IAppRoute, IAppRouteGroup, routes } from '@app/routes';
import { BarsIcon, ArrowLeftIcon } from '@patternfly/react-icons';
import kokuLogo from '@app/bgimages/koku-logo.png';

interface IAppLayout {
  children: React.ReactNode;
}

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  
  // Detect if running locally or on GitHub Pages
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const boardUrl = isDev ? '../../../index.html' : '/Cost-Management-Prototype/';

  const prototypeBanner = (
    <div style={{
      background: 'linear-gradient(90deg, #0066cc 0%, #004080 100%)',
      padding: '8px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <a 
        href={boardUrl}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'white',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'opacity 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        <ArrowLeftIcon style={{ fontSize: '12px' }} />
        Back to Prototypes Board
      </a>
      <div style={{
        color: 'white',
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: 'monospace',
        background: 'rgba(255, 255, 255, 0.2)',
        padding: '4px 12px',
        borderRadius: '4px'
      }}>
        COST-6922
      </div>
    </div>
  );

  const masthead = (
    <Masthead>
      <MastheadMain>
        <MastheadToggle>
          <Button
            icon={<BarsIcon />}
            variant="plain"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Global navigation"
          />
        </MastheadToggle>
        <MastheadBrand data-codemods>
          <MastheadLogo data-codemods component="div" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={kokuLogo} 
              alt="Koku Logo" 
              style={{ height: '40px', marginRight: '12px' }} 
            />
            <span style={{ 
              fontSize: '18px', 
              fontWeight: 500,
              color: 'var(--pf-t--global--text--color--regular)',
              whiteSpace: 'nowrap'
            }}>
              Cost Management
            </span>
            <Label color="blue" isCompact>work in progress prototype</Label>
          </MastheadLogo>
        </MastheadBrand>
      </MastheadMain>
    </Masthead>
  );

  const location = useLocation();

  const renderNavItem = (route: IAppRoute, index: number) => {
    // Make OpenShift not clickable
    if (route.label === 'OpenShift' && route.path === '/') {
      return (
        <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`} isActive={false}>
          <span style={{ cursor: 'default', color: 'var(--pf-t--global--text--color--regular)' }}>
            {route.label}
          </span>
        </NavItem>
      );
    }
    
    return (
      <NavItem key={`${route.label}-${index}`} id={`${route.label}-${index}`} isActive={route.path === location.pathname}>
        <NavLink
          to={route.path}
        >
          {route.label}
        </NavLink>
      </NavItem>
    );
  };

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number) => (
    <NavExpandable
      key={`${group.label}-${groupIndex}`}
      id={`${group.label}-${groupIndex}`}
      title={group.label}
      isActive={group.routes.some((route) => route.path === location.pathname)}
      isExpanded={group.label === 'Cost Management' ? true : undefined}
    >
      {group.routes.map((route, idx) => route.label && renderNavItem(route, idx))}
    </NavExpandable>
  );

  const Navigation = (
    <Nav id="nav-primary-simple">
      <NavList id="nav-list-simple">
        {routes.map(
          (route, idx) => route.label && (!route.routes ? renderNavItem(route, idx) : renderNavGroup(route, idx)),
        )}
      </NavList>
    </Nav>
  );

  const Sidebar = (
    <PageSidebar>
      <PageSidebarBody>{Navigation}</PageSidebarBody>
    </PageSidebar>
  );

  const pageId = 'primary-app-container';

  const PageSkipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        const primaryContentContainer = document.getElementById(pageId);
        primaryContentContainer?.focus();
      }}
      href={`#${pageId}`}
    >
      Skip to Content
    </SkipToContent>
  );
  return (
    <>
      {prototypeBanner}
      <Page
        mainContainerId={pageId}
        masthead={masthead}
        sidebar={sidebarOpen && Sidebar}
        skipToContent={PageSkipToContent}
      >
        {children}
      </Page>
    </>
  );
};

export { AppLayout };
