# Impact UI Page Patterns

Ready-to-use page layouts for common application patterns.

## Folder structure (required)

Never put the whole UI in `src/App.tsx`. Use the Impact Analytics production layout:

```
src/
  App.tsx                          # Routes only
  styles/layout.css
  constants/routes.tsx
  containers/Layout.tsx            # Header + Sidebar + Outlet
  containers/Routes.tsx
  components/screens/<screen>/
    index.tsx
    WelcomeBanner.tsx
    EmptyContent.tsx
    constants.ts
    filters/
```

- Layout owns Header and Sidebar
- Screen folders own FilterPanel, EmptyState, tables, and charts
- EmptyState primary button is `Apply Filter` and opens FilterPanel

## 1. Dashboard with Sidebar

Full application layout with navigation sidebar and content area.

```tsx
import { useState } from "react";
import { Header, Sidebar, Card, Table, Button, Badge } from "impact-ui";

const routes = [
  {
    label: "Dashboard",
    value: "dashboard",
    icon: <DashboardIcon />,
    link: "/dashboard",
  },
  {
    label: "Products",
    value: "products",
    icon: <InventoryIcon />,
    link: "/products",
  },
  {
    label: "Orders",
    value: "orders",
    icon: <ShoppingCartIcon />,
    link: "/orders",
  },
  {
    label: "Settings",
    value: "settings",
    icon: <SettingsIcon />,
    children: [
      { label: "General", value: "general", link: "/settings/general" },
      { label: "Security", value: "security", link: "/settings/security" },
    ],
  },
];

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeRoute, setActiveRoute] = useState("dashboard");

  return (
    <div className="app-container">
      <Header
        title="ProductName"
        userName="John Doe"
        showNotificationIcon
        showHelpIcon
        onLogoClick={() => navigate("/")}
      />
      <div className="main-layout" style={{ display: "flex" }}>
        <Sidebar
          isOpen={sidebarOpen}
          routes={routes}
          parentActive={activeRoute}
          handleParentRouteChange={(route) => setActiveRoute(route.value)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="content-area" style={{ flex: 1, padding: "24px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

## 2. Data Table Page

List page with filters, search, and data table.

```tsx
import { useState, useCallback } from "react";
import { Card, Table, FiltersStrip, Input, Button, Badge } from "impact-ui";
import SearchIcon from "@mui/icons-material/Search";

function DataTablePage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const columnDefs = [
    { field: "name", headerName: "Name", isSearchable: true },
    { field: "status", headerName: "Status", cellRenderer: StatusBadge },
    { field: "createdAt", headerName: "Created", valueFormatter: formatDate },
    { field: "actions", headerName: "", cellRenderer: ActionsRenderer },
  ];

  const filterConfig = [
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["Active", "Inactive"],
    },
    { key: "dateRange", label: "Date Range", type: "dateRange" },
  ];

  return (
    <Card>
      <Table
        tableHeader="Items"
        columnDefs={columnDefs}
        rowData={data}
        rowHeight="default"
        topLeftOptions={
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<SearchIcon />}
          />
        }
        topRightOptions={
          <>
            <FiltersStrip
              filters={filterConfig}
              filterValues={filters}
              onFilterChange={setFilters}
            />
            <Button variant="primary" onClick={handleCreate}>
              Add New
            </Button>
          </>
        }
        showDownloadButton
        onDownloadButtonClick={handleExport}
      />
    </Card>
  );
}

// Custom cell renderer for status
function StatusBadge({ value }) {
  const variant = value === "Active" ? "success" : "default";
  return <Badge label={value} variant={variant} />;
}
```

## 3. Form Modal

Modal with form fields and validation.

```tsx
import { useState } from "react";
import { Modal, Input, Select, DatePicker, TextArea, Switch } from "impact-ui";

function CreateItemModal({ open, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    category: null,
    description: "",
    dueDate: null,
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    { value: "cat1", label: "Category 1" },
    { value: "cat2", label: "Category 2" },
    { value: "cat3", label: "Category 3" },
  ];

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.category) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Item"
      size="medium"
      primaryButtonLabel="Create"
      primaryButtonProps={{ loading, disabled: loading }}
      secondaryButtonLabel="Cancel"
      onPrimaryButtonClick={handleSubmit}
      onSecondaryButtonClick={onClose}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Input
          label="Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={!!errors.name}
          helperText={errors.name}
        />

        <Select
          label="Category"
          required
          options={categoryOptions}
          value={formData.category}
          onChange={(option) => setFormData({ ...formData, category: option })}
          error={!!errors.category}
          helperText={errors.category}
        />

        <DatePicker
          label="Due Date"
          value={formData.dueDate}
          onChange={(date) => setFormData({ ...formData, dueDate: date })}
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
        />

        <Switch
          label="Active"
          checked={formData.isActive}
          onChange={(checked) =>
            setFormData({ ...formData, isActive: checked })
          }
        />
      </div>
    </Modal>
  );
}
```

## 4. Detail Page with Tabs

Detail view with tabbed content sections.

```tsx
import { useState } from "react";
import { Card, Tabs, Button, Badge, Avatar } from "impact-ui";

function DetailPage({ item }) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: "Overview", value: 0 },
    { label: "Activity", value: 1 },
    { label: "Settings", value: 2 },
  ];

  return (
    <div className="detail-page">
      {/* Header Section */}
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Avatar name={item.name} size="large" />
            <div>
              <h1 style={{ margin: 0, fontSize: "20px", fontWeight: 600 }}>
                {item.name}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#60697d" }}>
                {item.subtitle}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Badge
              label={item.status}
              variant={item.status === "Active" ? "success" : "default"}
            />
            <Button variant="secondary" onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="primary" onClick={handleAction}>
              Take Action
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabbed Content */}
      <Card style={{ marginTop: "16px" }}>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <div style={{ padding: "24px 0" }}>
          {activeTab === 0 && <OverviewTab item={item} />}
          {activeTab === 1 && <ActivityTab itemId={item.id} />}
          {activeTab === 2 && <SettingsTab item={item} />}
        </div>
      </Card>
    </div>
  );
}
```

## 5. Settings Page with Accordions

Settings organized in collapsible sections.

```tsx
import { AccordionModern, Switch, Input, Select, Button } from "impact-ui";

function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailDigest: "daily",
    theme: "light",
    twoFactor: false,
  });

  const accordionItems = [
    {
      title: "Notifications",
      subtitle: "Configure how you receive updates",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Switch
            label="Enable notifications"
            checked={settings.notifications}
            onChange={(checked) =>
              setSettings({ ...settings, notifications: checked })
            }
          />
          <Select
            label="Email digest frequency"
            options={[
              { value: "realtime", label: "Real-time" },
              { value: "daily", label: "Daily digest" },
              { value: "weekly", label: "Weekly digest" },
              { value: "never", label: "Never" },
            ]}
            value={settings.emailDigest}
            onChange={(option) =>
              setSettings({ ...settings, emailDigest: option.value })
            }
          />
        </div>
      ),
    },
    {
      title: "Appearance",
      subtitle: "Customize your experience",
      content: (
        <Select
          label="Theme"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
            { value: "system", label: "System" },
          ]}
          value={settings.theme}
          onChange={(option) =>
            setSettings({ ...settings, theme: option.value })
          }
        />
      ),
    },
    {
      title: "Security",
      subtitle: "Manage your account security",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Switch
            label="Two-factor authentication"
            checked={settings.twoFactor}
            onChange={(checked) =>
              setSettings({ ...settings, twoFactor: checked })
            }
          />
          <Button variant="secondary" type="destructive">
            Change Password
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="settings-page"
      style={{ maxWidth: "800px", margin: "0 auto" }}
    >
      <h1 style={{ marginBottom: "24px" }}>Settings</h1>

      <AccordionModern items={accordionItems} />

      <div
        style={{
          marginTop: "24px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
        }}
      >
        <Button variant="secondary">Reset to Defaults</Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
```

## 6. Empty State

When there's no data to display.

```tsx
import { EmptyState } from "impact-ui";

function NoDataView({ setShowFilterPanel }) {
  return (
    <EmptyState
      heading="No data available"
      description="Apply filters to see results or create new content"
      primaryButtonLabel="Apply Filters"
      onPrimaryButtonClick={() => setShowFilterPanel(true)}
    />
  );
}
```

Do **not** pass `emptyStateIcon`. EmptyState already renders its built-in illustration. Only set `emptyStateIcon` when the user explicitly provides a custom icon.

On dashboards with `FilterPanel`, the primary button label must be `Apply Filter` and `onPrimaryButtonClick` must open FilterPanel with `setShowFilterPanel(true)` — not `setShowFilters`.

## 7. Confirmation Dialog

Confirmation before destructive actions.

```tsx
import { Prompt } from "impact-ui";

function DeleteConfirmation({ open, itemName, onConfirm, onCancel }) {
  return (
    <Prompt
      open={open}
      title="Delete Item"
      message={`Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
      primaryButtonLabel="Delete"
      primaryButtonProps={{ type: "destructive" }}
      secondaryButtonLabel="Cancel"
      onPrimaryButtonClick={onConfirm}
      onSecondaryButtonClick={onCancel}
      onClose={onCancel}
    />
  );
}
```

## 8. Side Panel

Slide-out panel for details or editing.

```tsx
import { Panel, Input, Select, Button } from "impact-ui";

function EditPanel({ open, onClose, item }) {
  return (
    <Panel
      open={open}
      onClose={onClose}
      title={`Edit ${item?.name}`}
      width="480px"
      footer={
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Input label="Name" defaultValue={item?.name} />
        <Select
          label="Status"
          options={statusOptions}
          defaultValue={item?.status}
        />
        {/* More fields */}
      </div>
    </Panel>
  );
}
```

## Layout CSS Helpers

```css
/* Basic app layout */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
}

.content-area {
  flex: 1;
  padding: 24px;
  background: #f9fafb;
  overflow-y: auto;
}

/* Card grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

/* Form layout */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row > * {
  flex: 1;
}
```
