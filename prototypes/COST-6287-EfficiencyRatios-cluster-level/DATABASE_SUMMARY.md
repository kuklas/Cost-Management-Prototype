# Cost Management Database Summary

## CloudTech Solutions Inc. - Mock Database

### 📊 **Overview**
- **Company**: CloudTech Solutions Inc.
- **Industry**: SaaS Platform Provider
- **Total Monthly Cost**: $485,000
- **Currency**: USD

---

## 🏗️ **Infrastructure**

### OpenShift Clusters (4)
1. **Production US East** - $85,000/month
   - 250 nodes, AWS-based
   - Version: 4.14.3
   - CPU: 10,392 cores (78% utilized)
   - Memory: 40,178 GiB (82% utilized)
   - Storage: 15,300 GiB (96% utilized)

2. **Production EU West** - $65,000/month
   - 180 nodes, AWS-based
   - Version: 4.14.2

3. **Staging US Central** - $28,000/month
   - 45 nodes, GCP-based
   - Version: 4.14.3

4. **Development US West** - $17,000/month
   - 30 nodes, Azure-based
   - Version: 4.13.12

### Projects (18 across clusters)
- frontend-prod, backend-api-prod, data-pipeline-prod
- ml-training-prod, analytics-prod, mobile-app-prod
- monitoring-prod, logging-prod, security-prod
- frontend-staging, backend-api-staging, ml-training-staging
- worker-unallocated, platform-unallocated, openshift-monitoring
- dev-sandbox, qa-testing, temp-project-alpha

### AWS Accounts (2) - Total: $145,000/month
1. **AWS Production** - $115,000/month
   - Services: EC2, RDS, S3, EKS, Lambda, CloudFront
   - Regions: us-east-1, us-west-2, eu-west-1

2. **AWS Development** - $30,000/month
   - Services: EC2, S3, Lambda, RDS
   - Region: us-west-2

### GCP Accounts (2) - Total: $95,000/month
1. **GCP Production** - $65,000/month
   - Projects: frontend-prod-gcp, backend-api-gcp, data-pipeline-gcp
   - Services: Compute Engine, GKE, Cloud SQL, Cloud Storage
   - Regions: us-central1, europe-west1

2. **GCP ML Research** - $30,000/month
   - Projects: ml-training-gcp, ml-inference-gcp, ml-data-gcp
   - Services: Compute Engine, GKE, Cloud Storage
   - Region: us-central1

### Azure Accounts (2) - Total: $50,000/month
1. **Azure Enterprise** - $35,000/month
   - Services: Virtual Machines, AKS, SQL Database, Blob Storage
   - Regions: East US, West Europe

2. **Azure Backup & DR** - $15,000/month
   - Services: Backup, Site Recovery, Blob Storage
   - Regions: Central US, North Europe

---

## 🏷️ **Tags & Labels (8 tag keys)**

### Enabled Tags
1. **environment** - production, staging, development
   - Used across: OpenShift, AWS, GCP, Azure

2. **team** - frontend, backend, platform, data, ml-research, mobile, qa
   - Used in: OpenShift, GCP

3. **costCenter** - engineering, research, sales, marketing
   - Used in: OpenShift, GCP

4. **application** - api-gateway, user-service, payment-service, analytics-engine, ml-training
   - Used in: OpenShift, AWS, GCP

5. **project** - project-alpha, project-beta, project-gamma
   - Used in: AWS, GCP, Azure

6. **storageclass** - gp3, gp2, io1, standard
   - Used in: OpenShift, AWS

### Disabled Tags
7. **owner** - john-smith, jane-doe, bob-wilson
   - Used in: AWS, Azure

8. **version** - v1, v2, v3, canary
   - Used in: OpenShift

---

## 🔗 **Tag Mappings (4)**

Maps cloud provider tags to unified cost management keys:

1. **environment** → 
   - AWS: "Environment"
   - GCP: "env"
   - Azure: "Env"

2. **costCenter** → 
   - AWS: "CostCenter"
   - GCP: "cost_center"
   - Azure: "CostCentre"

3. **application** → 
   - AWS: "App"
   - GCP: "application"

4. **team** (disabled) → 
   - GCP: "team"
   - Azure: "Team"

---

## 📁 **Cost Categories (5)**

Custom groupings for cost allocation and reporting:

1. **Production Infrastructure** - $290,000/month
   - Rules: environment = "production"
   - Color: #E74C3C (red)

2. **Development & Testing** - $85,000/month
   - Rules: environment in ["development", "staging"]
   - Color: #3498DB (blue)

3. **ML & Data Science** - $45,000/month
   - Rules: team = "ml-research" OR project contains "ml-training"
   - Color: #9B59B6 (purple)

4. **Storage & Backup** - $28,000/month
   - Rules: service in ["S3", "Cloud Storage", "Blob Storage", "Backup"]
   - Color: #F39C12 (orange)

5. **Platform Services** - $37,000/month
   - Rules: project contains "openshift-" OR "platform-unallocated"
   - Color: #1ABC9C (green)

---

## 🖥️ **Platform Projects (12)**

OpenShift system and platform-level namespaces:

### Platform Overhead (distributed costs)
1. **openshift-apiserver** - API server for cluster management
2. **openshift-authentication** - Authentication services
3. **openshift-console** - Web-based management console
4. **openshift-monitoring** - Cluster monitoring and metrics
5. **openshift-ingress** - Ingress controller and routing
6. **openshift-kube-apiserver** - Core Kubernetes API server
7. **openshift-etcd** - Distributed key-value store
8. **openshift-image-registry** - Internal container image registry
9. **openshift-operators** - Operator lifecycle management

### Direct Allocation
10. **openshift-logging** - Cluster logging (not overhead)

### Unallocated
11. **platform-unallocated** - Platform costs not attributed to namespaces
12. **worker-unallocated** - Worker costs not attributed to workloads

### Settings
- **Distribute Platform Costs**: Enabled
- **Distribution Method**: Proportional
- **Include in Reports**: Yes
- **Exclude from Optimization**: Yes

---

## 💰 **Cost Models (5)**

1. **Standard OpenShift Model**
   - Source: OpenShift Container Platform
   - Markup: 0%
   - Created: 2024-08-15

2. **AWS Enterprise Discount**
   - Source: Amazon Web Services
   - Markup: 10%
   - Created: 2024-07-20

3. **GCP Committed Use**
   - Source: Google Cloud Platform
   - Discount: 15%
   - Created: 2024-08-01

4. **Azure Reserved Instances**
   - Source: Microsoft Azure
   - Discount: 8%
   - Created: 2024-06-10

5. **Dev Environment Model**
   - Source: OpenShift Container Platform
   - Discount: 5%
   - Created: 2024-09-01

---

## 📈 **Data Service API Methods**

### Access Methods Available

#### Tags
- `getAllTags()` - Get all tag keys
- `getEnabledTags()` - Get only enabled tags

#### Tag Mappings
- `getAllTagMappings()` - Get all tag mappings
- `getEnabledTagMappings()` - Get enabled mappings
- `getTagMappingById(id)` - Get specific mapping
- `getTagMappingsByParentKey(key)` - Get mappings for a parent key

#### Cost Categories
- `getAllCostCategories()` - Get all categories
- `getEnabledCostCategories()` - Get enabled categories
- `getCostCategoryById(id)` - Get specific category

#### Platform Projects
- `getAllPlatformProjects()` - Get all platform projects
- `getEnabledPlatformProjects()` - Get enabled projects
- `getPlatformProjectById(id)` - Get specific project
- `getPlatformProjectsByType(type)` - Get by type (platform/unallocated)
- `getOverheadPlatformProjects()` - Get overhead projects
- `getPlatformSettings()` - Get platform distribution settings

#### Cost Models
- `getAllCostModels()` - Get all cost models
- `getCostModelById(id)` - Get specific cost model

---

## 🎯 **Usage Example**

```typescript
import { dataService } from '@app/data/dataService';

// Get all enabled tags
const tags = dataService.getEnabledTags();

// Get cost categories
const categories = dataService.getEnabledCostCategories();

// Get platform projects that are overhead
const overheadProjects = dataService.getOverheadPlatformProjects();

// Get tag mappings for environment
const envMappings = dataService.getTagMappingsByParentKey('environment');

// Get platform settings
const settings = dataService.getPlatformSettings();
```

---

## ✅ **Current Status**

- ✅ Database structure created with 1,200+ lines of mock data
- ✅ TypeScript interfaces defined for all data types
- ✅ Data service methods implemented for accessing all data
- ✅ Webpack compiling successfully
- ✅ OpenShift page connected to database
- ✅ Cluster Detail page connected to database

### Next Steps
- Update Settings page to display tags, mappings, categories, and platform projects
- Update AWS, GCP, Azure pages with database data
- Update Overview page with aggregated data
- Add filtering and grouping based on tags and categories

