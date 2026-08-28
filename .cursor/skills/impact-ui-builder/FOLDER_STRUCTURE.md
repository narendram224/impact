# Impact Analytics Folder Structure

Use this layout for every generated UI. Do not put Header, Sidebar, FilterPanel, and EmptyState in `src/App.tsx`.

```
src/
  App.tsx                          # Routes only
  main.tsx                         # providers + impact-ui/styles + styles/layout.css
  styles/
    layout.css                     # app-shell (header/sidebar offsets)
  constants/
    routes.tsx                     # sidebarRoutes
  containers/
    Layout.tsx                     # Header + Sidebar + Notification + <Outlet />
    Routes.tsx                     # lazy-loaded screens
  components/
    screens/
      decisionDashboard/
        index.tsx                  # breadcrumbs, FiltersStrip, FilterPanel, content
        WelcomeBanner.tsx
        EmptyContent.tsx           # EmptyState — Apply Filter opens FilterPanel
        constants.ts
        filters/
          ProductFilterContent.tsx
          LocationFilterContent.tsx
          SavedFiltersContent.tsx
```

## Ownership

| File | Owns |
|------|------|
| `App.tsx` | `<Routes>` only |
| `containers/Layout.tsx` | Header, Sidebar, Notification |
| `components/screens/<screen>/index.tsx` | Breadcrumbs, FiltersStrip, FilterPanel, page content |
| `EmptyContent.tsx` | EmptyState (`Apply Filter` → `setShowFilterPanel(true)`) |
| `constants/` | Routes and shared config |

## EmptyState

- Omit `emptyStateIcon` (built-in illustration)
- `primaryButtonLabel="Apply Filter"`
- `onPrimaryButtonClick={() => setShowFilterPanel(true)}`
