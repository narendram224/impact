import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { formatMoney, formatUnits, formatPercent } from '../../../../services/dataProcessor';
import type { KPIValues } from '../../../../types';

interface KPICardsProps {
  kpiValues: KPIValues;
}

interface KPICardProps {
  title: string;
  icon: React.ReactNode;
  iaValue: string;
  finValue: string;
  lyValue: string;
}

function KPICard({ title, icon, iaValue, finValue, lyValue }: KPICardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-title">
        {icon}
        {title}
      </div>
      <div className="kpi-boxes">
        <div className="kpi-box kpi-box-ia">
          <div className="kpi-box-label">IA Recommended</div>
          <div className="kpi-box-value">{iaValue}</div>
        </div>
        <div className="kpi-box kpi-box-fin">
          <div className="kpi-box-label">Finalized</div>
          <div className="kpi-box-value">{finValue}</div>
        </div>
        <div className="kpi-box kpi-box-ly">
          <div className="kpi-box-label">Last Year</div>
          <div className="kpi-box-value">{lyValue}</div>
        </div>
      </div>
    </div>
  );
}

export function KPICards({ kpiValues }: KPICardsProps) {
  return (
    <div className="panel">
      <div className="kpi-grid">
        <KPICard
          title="Projected sell-through %"
          icon={<TrendingUpIcon style={{ fontSize: 17 }} />}
          iaValue={formatPercent(kpiValues.iaSellThrough)}
          finValue={formatPercent(kpiValues.finSellThrough)}
          lyValue={formatPercent(kpiValues.lySellThrough)}
        />
        <KPICard
          title="Markdown margin $ (est.)"
          icon={<AttachMoneyIcon style={{ fontSize: 17 }} />}
          iaValue={formatMoney(kpiValues.iaMargin)}
          finValue={formatMoney(kpiValues.finMargin)}
          lyValue={formatMoney(kpiValues.lyMargin)}
        />
        <KPICard
          title="Projected volume sold (units)"
          icon={<Inventory2Icon style={{ fontSize: 17 }} />}
          iaValue={formatUnits(kpiValues.iaVolume)}
          finValue={formatUnits(kpiValues.finVolume)}
          lyValue={formatUnits(kpiValues.lyVolume)}
        />
      </div>
    </div>
  );
}
