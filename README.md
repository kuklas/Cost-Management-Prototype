# Cost Management Prototypes

This repository contains multiple Cost Management prototypes organized by feature/ticket.

## 📁 Structure

```
Cost management/
├── index.html                          # Landing page to navigate between prototypes
├── prototypes/
│   ├── COST-6922-GoogleCloudInvoiceMonthCostPerspective/
│   │   ├── src/
│   │   ├── package.json
│   │   ├── webpack configs
│   │   └── ... (complete prototype files)
│   ├── COST-XXXX-NextFeature/         # Future prototypes...
│   └── COST-YYYY-AnotherFeature/
└── README.md
```

## 🚀 Getting Started

### Viewing the Landing Page

Simply open `index.html` in your browser to see all available prototypes.

### Working on a Prototype

1. Navigate to the prototype folder:
   ```bash
   cd "prototypes/COST-6922-GoogleCloudInvoiceMonthCostPerspective"
   ```

2. Install dependencies (first time only):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Deploy to GitHub Pages (from prototype folder):
   ```bash
   npm run deploy
   ```

### Creating a New Prototype

1. Copy an existing prototype folder:
   ```bash
   cp -r prototypes/COST-6922-GoogleCloudInvoiceMonthCostPerspective prototypes/COST-XXXX-YourFeatureName
   ```

2. Navigate to the new folder:
   ```bash
   cd prototypes/COST-XXXX-YourFeatureName
   ```

3. Update the prototype:
   - Modify `package.json` (name, description)
   - Make your feature changes in `src/`
   - Test locally with `npm start`

4. Add your prototype to the landing page:
   - Edit the root `index.html`
   - Add a new list item with your prototype's link and description

## 📦 Current Prototypes

### COST-6922: Google Cloud Invoice Month Cost Perspective
**Status:** ✅ Complete

**Features:**
- OpenShift cluster cost tracking
- AWS, GCP, and Azure cost management
- Cost Model management with markup/discount
- Tag management and cost categories
- Platform projects configuration
- Cost Explorer with detailed breakdowns
- Optimizations page with recommendations
- Invoice month vs usage date cost perspectives

**Tech Stack:**
- React 18
- TypeScript
- PatternFly 6
- React Router
- Webpack 5

## 🔧 Development

Each prototype is completely independent with its own:
- `package.json` and dependencies
- Build configuration (webpack)
- Source code (`src/`)
- Build output (`dist/`)

## 📝 Notes

- Each prototype can be developed and deployed independently
- The landing page provides easy navigation between prototypes
- Use semantic versioning for prototype versions if needed
- Keep prototypes focused on specific features/tickets

## 🌐 Deployment

Each prototype has its own deployment configuration. From within a prototype folder:

```bash
npm run deploy
```

This will build and deploy that specific prototype to GitHub Pages.

## 👥 Team

Cost Management Team

---

**Last Updated:** November 2025

