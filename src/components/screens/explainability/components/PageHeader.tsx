import { Fragment } from 'react';
import { Button } from 'impact-ui';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryIcon from '@mui/icons-material/History';
import UndoIcon from '@mui/icons-material/Undo';
import CheckIcon from '@mui/icons-material/Check';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { STRATEGY_INFO, STEPS } from '../constants';

interface PageHeaderProps {
  strategyInfo?: {
    name: string;
    startDate: string;
    endDate: string;
    days: number;
  };
}

export function PageHeader({ strategyInfo = STRATEGY_INFO }: PageHeaderProps) {
  return (
    <>
      {/* Page Title Row */}
      <div className="page-header">
        <h1 className="page-title">MD Strategy Detail</h1>
        <div className="spacer" />
        <Button variant="secondary" size="small">
          <AutoAwesomeIcon style={{ fontSize: 14, marginRight: 6 }} />
          Summarise
        </Button>
        <Button variant="secondary" size="small">
          <HistoryIcon style={{ fontSize: 14, marginRight: 6 }} />
          Version history
        </Button>
        <Button variant="text" size="small">
          <UndoIcon style={{ fontSize: 14, marginRight: 6 }} />
          Return to workbench
        </Button>
      </div>

      {/* Strategy Bar */}
      <div className="strategy-bar">
        <span className="chip strong">{strategyInfo.name}</span>
        <span className="chip">
          {strategyInfo.startDate} – {strategyInfo.endDate}
        </span>
        <span className="chip">{strategyInfo.days} days</span>
        <Button variant="text" size="small" style={{ padding: '7px 4px' }}>
          Edit
        </Button>
      </div>

      {/* Steps — flat siblings like HTML (wrapper divs break flex alignment) */}
      <div className="steps">
        {STEPS.map((step, index) => (
          <Fragment key={step.num}>
            <div className={`step ${step.status}`}>
              <span className="num">
                {step.status === 'done' ? (
                  <CheckIcon style={{ fontSize: 12 }} />
                ) : (
                  step.num
                )}
              </span>
              {step.label}
            </div>
            {index < STEPS.length - 1 ? (
              <span className="step-dots" aria-hidden>
                ···
              </span>
            ) : null}
          </Fragment>
        ))}
      </div>

      {/* Explanation Sub-header */}
      <div className="explain-sub-crumb">
        <div className="esc-left">
          <LightbulbIcon style={{ color: 'var(--c-primary-500)', fontSize: 18 }} />
          <span className="section-title">Explanation</span>
          <span className="chip" style={{ fontWeight: 600 }}>
            Step 3 of 3 · Ideation, not build-ready
          </span>
        </div>
        <div className="esc-right">
          <Button variant="text" size="small">
            <UndoIcon style={{ fontSize: 14, marginRight: 6 }} />
            Return to IA Recommended Results
          </Button>
        </div>
      </div>
    </>
  );
}
