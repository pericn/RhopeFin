# iFlow CLI Context for Hopeful Finance Project

## Project Overview

This is a **code project** - a local, browser-based financial modeling application for pet complex operations. The application helps users predict and analyze the financial performance of pet complexes, including revenue forecasting, cost analysis, investment return calculations, and scenario analysis.

Hopeful Finance is a pet complex business forecasting application specifically designed for the pet industry's financial analysis and business prediction. The application provides comprehensive financial modeling capabilities, including four major revenue sector calculations, cost analysis, and investment return calculations, suitable for roadshows, property negotiations, and investment decisions.

**Current Version**: v2.0 Modular Architecture with completed UI refactoring and optimization.

### Key Features
- Fully localized browser application with no network dependencies
- Modular architecture with React components
- Real-time financial calculations
- Support for preset parameters and custom modules
- Comprehensive financial metrics display (revenue, costs, profit, ROI, payback period)
- Parameterized financial modeling with all key parameters adjustable
- Data persistence using browser localStorage
- Preset parameter application with one-click functionality

### Technologies Used
- **Frontend Framework**: React 17 (via CDN)
- **UI Library**: Ant Design 5.12.8 (via CDN)
- **Styling**: Tailwind CSS 2.2.19 (via CDN)
- **State Management**: React useState/useEffect hooks
- **Storage**: localStorage
- **Module System**: Vanilla JavaScript ES6 modules
- **Build Tool**: Babel Standalone (in-browser JSX transpilation)

## Project Structure

```
.
├── index.html             # Original single-file version
├── index_v2.html          # v2.0 modular version entry point ⭐
├── app.js                 # Main application file integrating all modules
├── app.jsx                # JSX version (integrated into index.html)
├── initial.jsx            # Original simplified version
├── CLAUDE.md              # Project configuration document ⭐
├── DOCUMENTATION.md       # Complete technical documentation
├── README.md              # Usage instructions
├── IFLOW.md               # iFlow CLI context file
└── js/                    # Modular components directory ⭐
    ├── components/        # UI components (settings, charts, formulas)
    │   ├── ui-components.js      # Basic UI components
    │   ├── ui-components-antd.js # Ant Design component wrappers
    │   ├── formula-display.js    # Formula display components
    │   ├── chart-components.js   # Chart components
    │   ├── charts/               # Chart component directory
    │   │   ├── breakeven-chart.js
    │   │   ├── breakeven-svg-chart.js
    │   │   ├── cost-chart.js
    │   │   ├── index.js
    │   │   ├── margin-chart.js
    │   │   ├── README.md
    │   │   ├── revenue-chart.js
    │   │   └── scenario-chart.js
    │   └── settings/             # Settings component directory
    │       ├── basic-settings.js
    │       ├── cost-settings.js
    │       ├── investment-settings.js
    │       └── revenue-settings.js
    ├── core/              # Core modules (data management, calculation engine)
    │   ├── data-manager.js       # Data manager
    │   ├── formula-engine.js     # Formula engine
    │   └── calculators/          # Calculator modules directory
    │       ├── analysis-helper.js
    │       ├── breakeven-calculator.js
    │       ├── cost-calculator.js
    │       ├── index.js
    │       ├── investment-calculator.js
    │       ├── main-calculator.js
    │       ├── profitability-calculator.js
    │       ├── README.md
    │       ├── revenue-calculator.js
    │       └── scenario-calculator.js
    ├── modules/           # Business modules (revenue, cost, investment managers)
    │   ├── breakeven/
    │   │   ├── analysis-core.js
    │   │   ├── index.js
    │   │   ├── insights-analysis.js
    │   │   ├── risk-tolerance.js
    │   │   ├── sensitivity-calc.js
    │   │   ├── sensitivity.js
    │   │   ├── target-margin-calc.js
    │   │   ├── target-margin.js
    │   │   ├── utils.js
    │   │   ├── visualization-core.js
    │   │   ├── visualization-data.js
    │   │   ├── visualization-insights.js
    │   │   ├── visualization-svg.js
    │   │   └── visualization.js
    │   ├── business/             # Business logic modules
    │   │   ├── cost-manager.js
    │   │   ├── formula-help.js
    │   │   ├── index.js
    │   │   ├── investment-manager.js
    │   │   ├── module-editor.js
    │   │   ├── README.md
    │   │   ├── revenue-manager.js
    │   │   └── validate.js
    │   └── scenario/
    │       ├── chart.js
    │       ├── comparison.js
    │       ├── index.js
    │       ├── insights.js
    │       ├── parameters.js
    │       ├── README.md
    │       └── recommendations.js
    └── pages/             # Page components (overview, settings, analysis)
        ├── analysis-page.js
        ├── overview-page.js
        └── settings-page-v2.js
```

## Core Modules

1. **DataManager** (`js/core/data-manager.js`): Handles data structure, localStorage operations, and data validation
2. **FormulaEngine** (`js/core/formula-engine.js``): Evaluates mathematical formulas and manages system variables
3. **Calculator Modules** (`js/core/calculators/`): Modular financial calculation engine for revenue, costs, profitability, etc.
   - MainCalculator (`main-calculator.js`): Main calculator coordinator
   - RevenueCalculator (`revenue-calculator.js`): Revenue calculations
   - CostCalculator (`cost-calculator.js`): Cost calculations
   - InvestmentCalculator (`investment-calculator.js`): Investment calculations
   - ProfitabilityCalculator (`profitability-calculator.js`): Profitability metrics
   - ScenarioCalculator (`scenario-calculator.js`): Scenario analysis
   - BreakevenCalculator (`breakeven-calculator.js`): Break-even analysis
   - AnalysisHelper (`analysis-helper.js`): Comprehensive analysis helper
4. **UIComponents** (`js/components/ui-components-antd.js`): Ant Design-based UI component library
5. **Business Modules** (`js/modules/business/`): Specialized modules for revenue, cost, and investment management
6. **Page Components** (`js/pages/`): Main page components for settings, overview, and analysis

## Building and Running

This is a client-side application that runs directly in the browser:

1. **To run**: Simply open `index_v2.html` in a web browser (recommended) or `index.html`
2. **No build step required**: The application uses CDN-loaded dependencies
3. **Data persistence**: Uses browser localStorage for saving user inputs
4. **No server dependencies**: All calculations happen client-side

### Development Commands
- There are no specific build or development commands as this is a static HTML/JS application
- To modify the application, edit the JavaScript files directly
- Changes are reflected immediately upon browser refresh

### Running with Local Server
```bash
# Using Python to start a local server
python -m http.server 8000
# Then visit http://localhost:8000/index_v2.html

# Or using Node.js
npx serve .
# Visit http://localhost:3000/index_v2.html

# Or using http-server
npx http-server
# Visit http://localhost:8080/index_v2.html
```

## Development Conventions

### Code Organization
- Modular architecture with each feature in separate files
- Core business logic separated from UI components
- Use of React functional components with hooks
- Global modules attached to `window` object for inter-module communication
- Module-based calculator architecture with separate calculators for different functions
- Component-based UI architecture with reusable components

### Code Architecture Guidelines
- **File Line Limit**: JavaScript files should not exceed 200 lines
- **Folder Structure Limit**: Each folder should contain no more than 8 files
- **Avoid Deep Nesting**: Avoid more than 3 levels of nesting
- **Avoid Circular Dependencies**: Modules should not depend on each other circularly
- **Single Responsibility**: Each module should have a single clear purpose

### Data Management
- Centralized data structure managed by DataManager
- Data validation before saving/updating
- localStorage used for persistence with automatic merging of new fields
- Support for data export and import functionality

### Calculation Engine
- FormulaEngine handles all mathematical computations
- Modular calculator architecture with separate calculators for revenue, costs, investment, profitability, etc.
- All calculations are pure functions with clear inputs/outputs
- Support for custom formulas and variables

### UI Components
- Ant Design components used for consistent UI
- Custom wrapper components for frequently used UI elements
- Responsive design with Tailwind CSS utility classes
- Component-based architecture with reusable settings and chart components
- Support for both basic UI components and Ant Design enhanced components

### Error Handling
- Comprehensive error boundaries in React
- Module loading error handling
- Data validation with user-friendly error messages
- Graceful degradation when modules fail to load

### State Management
- Use React Hooks for managing all financial parameter states
- localStorage implementation for data persistence
- Support for one-click preset parameter application

## Key Files for Development

1. `index_v2.html` - Main entry point and module loader (recommended)
2. `app.js` - Main application component and state management
3. `js/core/data-manager.js` - Data structure and persistence
4. `js/core/calculators/main-calculator.js` - Main financial calculation coordinator
5. `js/core/calculators/revenue-calculator.js` - Revenue calculation logic
6. `js/core/calculators/cost-calculator.js` - Cost calculation logic
7. `js/core/calculators/investment-calculator.js` - Investment calculation logic
8. `js/components/settings/*.js` - Parameter input components
9. `js/pages/settings-page-v2.js` - Settings page component
10. `js/pages/overview-page.js` - Financial analysis page component
11. `js/pages/analysis-page.js` - Sensitivity analysis page component
12. `js/modules/business/*.js` - Business logic modules

This context should provide sufficient information for iFlow CLI to understand and assist with development tasks in this pet complex financial modeling application.