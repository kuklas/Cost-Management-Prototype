# 🚀 Quick Start Guide

## Current Setup ✅

Your Cost Management prototypes are now organized and ready to use!

## 📂 What Changed?

All your work has been moved into:
```
prototypes/COST-6922-GoogleCloudInvoiceMonthCostPerspective/
```

## 🎯 How to Use

### Option 1: View Landing Page (Recommended)

1. **Start the landing page server:**
   ```bash
   ./serve-landing.sh
   ```
   Or manually:
   ```bash
   python3 -m http.server 8080
   ```

2. **Open in browser:**
   - http://localhost:8080

3. **Start working on a prototype:**
   - The landing page will automatically detect you're in dev mode
   - Click on a prototype card to open it (runs on port 3000)

### Option 2: Work Directly on a Prototype

1. **Navigate to prototype:**
   ```bash
   cd "prototypes/COST-6922-GoogleCloudInvoiceMonthCostPerspective"
   ```

2. **Start dev server:**
   ```bash
   PORT=3000 npm start
   ```

3. **Open in browser:**
   - http://localhost:3000

## 🆕 Creating a New Prototype

When you're ready to add a new feature:

1. **Copy existing prototype:**
   ```bash
   cp -r prototypes/COST-6922-GoogleCloudInvoiceMonthCostPerspective \
         prototypes/COST-XXXX-YourFeatureName
   ```

2. **Update the landing page:**
   - Edit `index.html`
   - Add your new prototype to the `prototypes` array:
   ```javascript
   {
       id: 'COST-XXXX',
       title: 'Your Feature Name',
       description: 'Description of what this prototype does...',
       path: 'prototypes/COST-XXXX-YourFeatureName',
       devPort: 3001,  // Use a different port for each prototype
       status: 'active'
   }
   ```

3. **Work on your new prototype:**
   ```bash
   cd prototypes/COST-XXXX-YourFeatureName
   PORT=3001 npm start
   ```

## 🌐 Currently Running

- **Landing Page:** http://localhost:8080 (if serve-landing.sh is running)
- **COST-6922 Prototype:** http://localhost:3000 ✅ (currently running)

## 📝 Making Changes

1. Navigate to the prototype folder
2. Make your code changes in `src/`
3. The dev server will auto-reload
4. When ready to deploy, run `npm run deploy` from the prototype folder

## 🎨 Structure Benefits

- ✅ Each prototype is independent
- ✅ Easy to compare different versions
- ✅ Landing page for easy navigation
- ✅ Can run multiple prototypes simultaneously (different ports)
- ✅ Clean organization by feature/ticket

## 🔧 Troubleshooting

**Landing page not loading prototypes?**
- Make sure the dev server is running: `cd prototypes/COST-6922-GoogleCloudInvoiceMonthCostPerspective && npm start`
- Check the browser console for errors

**Port already in use?**
- Change the PORT variable: `PORT=3001 npm start`
- Update the devPort in index.html to match

**Need to build for production?**
```bash
cd prototypes/COST-6922-GoogleCloudInvoiceMonthCostPerspective
npm run build
```

## ✨ Next Steps

You're all set! The landing page and prototype are ready to use. Just let me know what changes you'd like to make to the prototype! 🎉

