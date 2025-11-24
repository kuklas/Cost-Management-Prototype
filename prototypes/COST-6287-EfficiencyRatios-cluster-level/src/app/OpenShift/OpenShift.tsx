import * as React from 'react';
import { PageSection, Title } from '@patternfly/react-core';

const OpenShift: React.FunctionComponent = () => (
  <PageSection hasBodyWrapper={false}>
    <Title headingLevel="h1" size="lg">OpenShift</Title>
    <p>Monitor and manage your OpenShift infrastructure and costs.</p>
  </PageSection>
);

export { OpenShift };

