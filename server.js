const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static files from each prototype's dist folder
const prototypes = [
  'COST-3353-ReportBuilder',
  'COST-5691-UserConfigurableThresholds',
  'COST-6922-GoogleCloudInvoiceMonthCostPerspective',
  'COST-6881-AddingArchitectureForOCPNodeAndClusters',
  'COST-6951-CostTiers',
  'COST-6287-EfficiencyRatios-cluster-level',
  'RHINENG-11890-Namespace-Project-level-recommendations',
  'COST-5109-GPU',
  'COST-5705-ResourceOptimizationGPUs'
];

prototypes.forEach(prototype => {
  app.use(
    `/prototypes/${prototype}`,
    express.static(path.join(__dirname, 'prototypes', prototype, 'dist'))
  );
});

// Serve any other static files from root
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`\n🚀 Prototypes server running on http://localhost:${PORT}`);
  console.log(`\n📋 Landing page: http://localhost:${PORT}`);
  console.log(`\n Available prototypes:`);
  prototypes.forEach(prototype => {
    console.log(`   - http://localhost:${PORT}/prototypes/${prototype}/`);
  });
  console.log('\n');
});

