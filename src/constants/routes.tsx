import type { SidebarRoute } from 'impact-ui';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import VerifiedIcon from '@mui/icons-material/Verified';
import TuneIcon from '@mui/icons-material/Tune';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const sidebarRoutes: SidebarRoute[] = [
  {
    label: 'Decision Dashboard',
    value: 'decision-dashboard',
    icon: <ShowChartIcon />,
    link: '/decision-dashboard',
  },
  {
    label: 'Markdown Workbench',
    value: 'markdown-workbench',
    icon: <LightbulbIcon />,
    link: '/markdown-workbench',
    children: [
      {
        label: 'Create MD Strategy',
        value: 'create-strategy',
        link: '/markdown-workbench/create-strategy',
      },
      {
        label: 'MD Strategy Detail',
        value: 'strategy-detail',
        link: '/markdown-workbench/strategy-detail',
      },
    ],
  },
  {
    label: 'Approval',
    value: 'approval',
    icon: <VerifiedIcon />,
    link: '/approval',
  },
  {
    label: 'Configurations',
    value: 'configurations',
    icon: <TuneIcon />,
    link: '/configurations',
  },
  {
    label: 'Reporting',
    value: 'reporting',
    icon: <AssessmentIcon />,
    link: '/reporting',
  },
];

export const breadcrumbConfig: Record<string, { label: string; to?: string }[]> = {
  '/decision-dashboard': [
    { label: 'Home', to: '/' },
    { label: 'Decision Dashboard' },
  ],
  '/markdown-workbench': [
    { label: 'Home', to: '/' },
    { label: 'Markdown Workbench' },
  ],
  '/markdown-workbench/create-strategy': [
    { label: 'Markdown Workbench', to: '/markdown-workbench' },
    { label: 'Create MD Strategy' },
  ],
  '/markdown-workbench/strategy-detail': [
    { label: 'Markdown Workbench', to: '/markdown-workbench' },
    { label: 'Create MD Strategy', to: '/markdown-workbench/create-strategy' },
    { label: 'MD Strategy Detail' },
  ],
  '/approval': [
    { label: 'Home', to: '/' },
    { label: 'Approval' },
  ],
  '/configurations': [
    { label: 'Home', to: '/' },
    { label: 'Configurations' },
  ],
  '/reporting': [
    { label: 'Home', to: '/' },
    { label: 'Reporting' },
  ],
};
