import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header, Sidebar, Notification } from 'impact-ui';
import type {
  SidebarRoute,
  NotificationPanelItem,
  NotificationListItemData,
} from 'impact-ui';
import { sidebarRoutes } from '../constants/routes';

const createNotificationItem = (
  overrides: Partial<NotificationListItemData>
): NotificationListItemData => ({
  id: '',
  selected: false,
  status: 'success',
  read: false,
  date: new Date(),
  time: Date.now(),
  label: '',
  description: 'Open this item to review the latest update.',
  ...overrides,
});

const initialNotificationPanels: NotificationPanelItem[] = [
  {
    id: 1,
    value: 'task-list',
    notificationList: [
      createNotificationItem({
        id: 'notif-1',
        status: 'success',
        read: false,
        label: 'Markdown optimization completed',
        description:
          'Fall Clearance strategy recommendations are ready for review.',
      }),
      createNotificationItem({
        id: 'notif-2',
        status: 'pending',
        read: false,
        label: 'Strategy needs approval',
        description: '3 product categories are waiting in Approval Hub.',
      }),
      createNotificationItem({
        id: 'notif-3',
        status: 'fail',
        read: true,
        label: 'Inventory alert',
        description: '12 SKUs in Outerwear are below safety stock levels.',
      }),
    ],
  },
  {
    id: 2,
    value: 'info-list',
    notificationList: [
      createNotificationItem({
        id: 'info-1',
        status: 'success',
        read: false,
        label: 'Data synced today',
        description: 'Product and pricing data refreshed from source.',
      }),
    ],
  },
];

const notificationTabs = [
  { label: 'Task List', value: 'task-list' },
  { label: 'Info', value: 'info-list' },
];

const notificationBadges = [
  {
    id: 1,
    value: 'task-list',
    lists: [
      { id: 1, label: 'New', numberOfTypes: 2 },
      { id: 2, label: 'Pending', numberOfTypes: 1 },
    ],
  },
  {
    id: 2,
    value: 'info-list',
    lists: [{ id: 1, label: 'Recent', numberOfTypes: 1 }],
  },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationPanels, setNotificationPanels] = useState<
    NotificationPanelItem[]
  >(initialNotificationPanels);
  const [activeNotiTab, setActiveNotiTab] = useState('task-list');

  const { parentActive, childActive } = useMemo(() => {
    const path = location.pathname;
    for (const route of sidebarRoutes) {
      if (route.children?.length) {
        const child = route.children.find((item) => item.link === path);
        if (child) return { parentActive: route.value, childActive: child.value };
        if (route.link && path.startsWith(route.link)) {
          return { parentActive: route.value, childActive: '' };
        }
      }
      if (route.link && path.startsWith(route.link)) {
        return { parentActive: route.value, childActive: '' };
      }
    }
    return { parentActive: 'markdown-workbench', childActive: 'strategy-detail' };
  }, [location.pathname]);

  const handleParentRouteChange = useCallback(
    (route: SidebarRoute) => {
      if (route.link) navigate(route.link);
    },
    [navigate]
  );

  const handleChildRouteChange = useCallback(
    (_parent: SidebarRoute, child: SidebarRoute) => {
      if (child.link) navigate(child.link);
    },
    [navigate]
  );

  const unreadCount = useMemo(() => {
    return notificationPanels.reduce((total, panel) => {
      if (!Array.isArray(panel.notificationList)) return total;
      return (
        total +
        panel.notificationList.filter(
          (item) => typeof item === 'object' && item && 'read' in item && !item.read
        ).length
      );
    }, 0);
  }, [notificationPanels]);

  const handleMarkAllRead = () => {
    setNotificationPanels((panels) =>
      panels.map((panel) => ({
        ...panel,
        notificationList: Array.isArray(panel.notificationList)
          ? panel.notificationList.map((item) =>
              typeof item === 'object' && item && 'read' in item
                ? { ...item, read: true }
                : item
            )
          : panel.notificationList,
      }))
    );
  };

  return (
    <div className="app-shell">
      <Header
        title="PriceSmart · Markdown"
        userName="AM"
        showNotificationIcon
        notificationIndicator={unreadCount > 0}
        handleNotificationClick={() => setShowNotifications(true)}
        showHelpIcon
        showChatBotIcon
        handleLogoClick={() => navigate('/markdown-workbench/strategy-detail')}
        dropMenuOptions={[
          { label: 'Profile', onClick: () => undefined },
          { label: 'Logout', onClick: () => undefined },
        ]}
      />
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        routes={sidebarRoutes}
        parentActive={parentActive}
        childActive={childActive}
        handleParentRouteChange={handleParentRouteChange}
        handleChildRouteChange={handleChildRouteChange}
        handleClose={() => setSidebarOpen((open) => !open)}
        handleLogOut={() => undefined}
        isCloseWhenClickOutside
        isMemoryRouter={false}
      />
      <Notification
        title="Notifications"
        isOpen={showNotifications}
        setIsOpen={setShowNotifications}
        handleClose={() => setShowNotifications(false)}
        notificationTabs={notificationTabs}
        notificationPanels={notificationPanels}
        setNotificationPanels={setNotificationPanels}
        badgesList={notificationBadges}
        activeNotiTab={activeNotiTab}
        handleTabChange={setActiveNotiTab}
        handleMarkReadAll={handleMarkAllRead}
        isHoverOnCard
        isChipsExpandable
      />
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  );
}
