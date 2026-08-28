---
name: impact-ui-builder
description: Build UIs using Impact UI component library. Use when creating pages, components, forms, tables, dashboards, or any React UI. Use when analyzing screenshots or mockups to implement. ALWAYS use impact-ui components - never use raw HTML, plain MUI, or other UI libraries.
author: Narendra
---

# Impact UI Builder

**Author: Narendra** — developed this skill so agents always build with Impact UI (components, tokens, and MCP tools), not raw HTML or plain MUI.

**CRITICAL**: When building any UI in this project, you MUST use `impact-ui` components. Do NOT use:

- Raw HTML elements for UI (use impact-ui components)
- Plain Material-UI components directly (impact-ui wraps MUI with our design system)
- Other UI libraries (Chakra, Ant Design, etc.)
- Custom CSS for things that impact-ui handles

## Folder structure (required)

Never dump a page into `src/App.tsx`. Follow the Impact Analytics production layout:

```
src/
  App.tsx                          # Routes only
  main.tsx                         # providers + impact-ui/styles + styles/layout.css
  styles/layout.css                # app-shell offsets
  constants/routes.tsx             # sidebarRoutes
  containers/Layout.tsx            # Header + Sidebar + <Outlet />
  containers/Routes.tsx            # lazy screen routes
  components/screens/<screen>/
    index.tsx                      # page composition
    WelcomeBanner.tsx
    EmptyContent.tsx               # EmptyState — Apply Filter opens FilterPanel
    constants.ts
    filters/
```

Rules:

- `App.tsx` only mounts routes
- `Layout.tsx` owns Header and Sidebar
- Screen logic, FilterPanel, and EmptyState live under `components/screens/<screen>/`
- EmptyState: omit `emptyStateIcon`; `primaryButtonLabel="Apply Filter"`; click opens FilterPanel via `setShowFilterPanel(true)`

Call `build_ui` or `get_page_patterns` with `pattern: "folder-structure"` to get the full file contents.

## Quick Start

```tsx
// REQUIRED: Import styles once at app entry point
import "impact-ui/styles";

// Import components from impact-ui
import { Button, Input, Modal, Table, Select } from "impact-ui";
```

## Before Building Any UI

### Quick Start: Use `build_ui` Tool

**This is the smartest way to build UI.** Just describe what you need:

```
build_ui with description: "analytics dashboard with KPIs and charts"
build_ui with description: "inventory management with stock alerts"
build_ui with description: "user list with CRUD operations"
```

The `build_ui` tool understands your intent and returns complete, ready-to-use code.

### All Available MCP Tools

| Tool                   | When to Use                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| `build_ui`             | **Start here** - Describe what you need, get complete implementation |
| `get_design_tokens`    | Need specific colors, spacing, typography values                     |
| `compose_components`   | Combining specific components for a pattern                          |
| `get_component_info`   | Deep dive into a specific component's props                          |
| `list_components`      | See all available components                                         |
| `generate_page_layout` | Get basic page templates                                             |

### Additional References

- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) - Complete color, typography, spacing reference
- [PAGE_PATTERNS.md](PAGE_PATTERNS.md) - Common page layouts
- [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) - Required src/ layout for generated UIs
- [COMPONENT_COMPOSITIONS.md](COMPONENT_COMPOSITIONS.md) - How to combine components

## Component Categories

### Core Components

| Component          | Use For                         |
| ------------------ | ------------------------------- |
| `Button`           | Actions, CTAs, form submissions |
| `Input`            | Text input, search fields       |
| `Select`           | Dropdowns, single/multi select  |
| `Checkbox`         | Boolean selections              |
| `RadioButtonGroup` | Mutually exclusive options      |
| `Switch`           | Toggle settings                 |
| `TextArea`         | Multi-line text input           |

### Layout & Navigation

| Component     | Use For                                  |
| ------------- | ---------------------------------------- |
| `Header`      | App header with user info, notifications |
| `Sidebar`     | Main navigation                          |
| `Tabs`        | Content organization                     |
| `Breadcrumbs` | Navigation hierarchy                     |
| `Card`        | Content containers                       |
| `Panel`       | Slide-out side panels                    |
| `Modal`       | Dialogs, confirmations                   |
| `BottomSheet` | Mobile-friendly panels                   |

### Data Display

| Component     | Use For                    |
| ------------- | -------------------------- |
| `Table`       | Data grids (AG-Grid based) |
| `Badge`       | Status indicators          |
| `Tag`         | Labels, categories         |
| `Avatar`      | User representations       |
| `EmptyState`  | No data placeholders       |
| `ProgressBar` | Progress indication        |

### Feedback

| Component | Use For                 |
| --------- | ----------------------- |
| `Alert`   | Inline messages         |
| `Toast`   | Temporary notifications |
| `Loader`  | Loading states          |
| `Prompt`  | Confirmation dialogs    |

### Forms & Filters

| Component         | Use For               |
| ----------------- | --------------------- |
| `FilterPanel`     | Filter configurations |
| `FiltersStrip`    | Horizontal filter bar |
| `DatePicker`      | Single date selection |
| `DateRangePicker` | Date range selection  |
| `MonthPicker`     | Month selection       |
| `FileUpload`      | File uploads          |

### Patterns (Pre-built Layouts)

| Pattern          | Use For                     |
| ---------------- | --------------------------- |
| `HomePage`       | Landing/dashboard pages     |
| `CommentsPanel`  | Discussion threads          |
| `CreateItemFlow` | Multi-step creation wizards |

## Design System Values

### Colors (Use these, don't create custom colors)

```scss
// Primary - Use for CTAs, primary actions
$primary: #4259ee;
$primaryHover: #3649c6;

// Status colors
$success: #3bb273;
$error: #ec4c5c;
$warning: #e1bc29;

// Text colors
$textPrimary: #1f2b4d;
$textSecondary: #60697d;

// Backgrounds
$background: #ffffff;
$backgroundSecondary: #f5f6fa;
$border: #d9dde7;
```

### Typography

```scss
$fontFamily: "Manrope", sans-serif;
$fontSizes: (
  small: 12px,
  normal: 14px,
  medium: 16px,
  large: 20px,
);
$fontWeights: (
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
);
```

### Spacing

```scss
$spacing: (
  p1: 4px,
  p2: 8px,
  p3: 12px,
  p4: 16px,
  p5: 20px,
  p6: 24px,
  p7: 28px,
  p8: 32px,
);
```

### Border Radius

```scss
$borderRadius: 8px;
$borderRadiusLarge: 16px;
```

## Page Building Workflow

### 1. Dashboard/List Page

```tsx
import { Header, Sidebar, Table, FiltersStrip, Button, Card } from "impact-ui";

function DashboardPage() {
  return (
    <div className="app-layout">
      <Header title="Product Name" userName="John" />
      <div className="content-area">
        <Sidebar routes={routes} isOpen={sidebarOpen} />
        <main>
          <Card>
            <FiltersStrip filters={filters} onFilterChange={handleFilter} />
            <Table columnDefs={columns} rowData={data} tableHeader="Items" />
          </Card>
        </main>
      </div>
    </div>
  );
}
```

### 2. Form Page

```tsx
import { Modal, Input, Select, Button, DatePicker } from "impact-ui";

function FormModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Item"
      primaryButtonLabel="Save"
      secondaryButtonLabel="Cancel"
      onPrimaryButtonClick={handleSave}
    >
      <Input label="Name" required />
      <Select label="Category" options={categories} />
      <DatePicker label="Due Date" />
    </Modal>
  );
}
```

### 3. Settings Page

```tsx
import { AccordionModern, Switch, Input, Button } from "impact-ui";

function SettingsPage() {
  return (
    <div className="settings-page">
      <AccordionModern
        items={[
          {
            title: "General Settings",
            content: (
              <>
                <Switch label="Enable notifications" />
                <Input label="Display name" />
              </>
            ),
          },
          {
            title: "Security",
            content: <Switch label="Two-factor authentication" />,
          },
        ]}
      />
      <Button variant="primary">Save Changes</Button>
    </div>
  );
}
```

## Screenshot-to-Implementation Guide

When given a screenshot or mockup:

1. **Identify visual patterns**:
   - Data grid → `Table`
   - Navigation bar at top → `Header`
   - Side navigation → `Sidebar`
   - Cards/tiles → `Card`
   - Popup/overlay → `Modal` or `Panel`
   - Form fields → `Input`, `Select`, `DatePicker`
   - Buttons → `Button` with appropriate `variant`
   - Status labels → `Badge` or `Tag`
   - Tabs → `Tabs`
   - Filters → `FiltersStrip` or `FilterPanel`

2. **Map to impact-ui components** using the tables above

3. **Use MCP tools** to get exact props and examples

4. **Apply design tokens** for any custom styling needed

## Common Mistakes to Avoid

❌ **Don't do this:**

```tsx
// Wrong: Using raw MUI
import Button from '@mui/material/Button';

// Wrong: Custom colors
<div style={{ backgroundColor: '#123456' }}>

// Wrong: Raw HTML for UI elements
<button onClick={}>Submit</button>

// Wrong: Passing a made-up icon to EmptyState
<EmptyState emptyStateIcon={<InboxIcon />} heading="No data" />

// Wrong: Entire dashboard in App.tsx
function App() { return <Header /><Sidebar /><EmptyState /> }
```

✅ **Do this instead:**

```tsx
// Correct: Use impact-ui
import { Button } from 'impact-ui';

// Correct: Use design tokens via className
<div className="ia-styles ia-bg-secondary">

// Correct: Use Button component
<Button variant="primary" onClick={}>Submit</Button>

// Correct: Omit emptyStateIcon; primary CTA opens FilterPanel
<EmptyState
  heading="No data available"
  description="Apply filters to see results"
  primaryButtonLabel="Apply Filter"
  onPrimaryButtonClick={() => setShowFilterPanel(true)}
/>
```

## Additional Resources

- [DESIGN_TOKENS.md](DESIGN_TOKENS.md) - Complete color, typography, spacing reference
- [PAGE_PATTERNS.md](PAGE_PATTERNS.md) - Common page layouts and folder structure
- [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) - Required src/ layout for generated UIs
- [COMPONENT_COMPOSITIONS.md](COMPONENT_COMPOSITIONS.md) - How to combine components
