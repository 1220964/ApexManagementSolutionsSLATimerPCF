import * as React from 'react';
import { useEffect, useState } from 'react';
import { IconCircleCheck, IconClock, IconAlertCircle, IconX, IconRefresh } from '@tabler/icons-react';
import { Spinner } from '@fluentui/react-components';
import { fetchChecklistData, calculateCompletionPercentage } from './checklistFunctions';
import { IChecklistItem, IChecklistProps } from './slaTimerPCF/Interface/IChecklistItem';

export const ChecklistProgress: React.FC<IChecklistProps> = ({ maintenanceActivityId, context }) => {
  const [items, setItems] = useState<IChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchChecklistData(maintenanceActivityId, context);
      setItems(data);
      setPct(calculateCompletionPercentage(data));
    } finally { setLoading(false); }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); //30s 
    return () => clearInterval(id);
  }, [maintenanceActivityId]);

  const iconFor = (s: IChecklistItem['status']) => {
    if (s === 'completed') return <IconCircleCheck className="checklist-icon checklist-icon-completed" stroke={2}/>;
    if (s === 'waiting')   return <IconClock className="checklist-icon checklist-icon-waiting" stroke={2}/>;
    if (s === 'blocked')   return <IconAlertCircle className="checklist-icon checklist-icon-blocked" stroke={2}/>;
    return <IconX className="checklist-icon checklist-icon-pending" stroke={2}/>;
  };

  const statusText = (i: IChecklistItem) =>
    i.count && !i.completed ? `(${i.count.current}/${i.count.total})` :
    i.status === 'waiting' ? '(waiting...)' :
    i.status === 'blocked' ? '(blocked)' :
    i.status === 'pending' ? '(pending)' : '';

  if (loading) {
    return <div className="checklist-loading"><Spinner size="small"/><span className="checklist-loading-text">Loading checklist...</span></div>;
  }

  return (
    <div className="checklist-container">
      <div className="checklist-header">
        <h3 className="checklist-title">Activity Milestones</h3>
        <div className="checklist-percentage">
          <span className="checklist-percentage-value">{pct}%</span>
          <span className="checklist-percentage-label">Complete</span>
        </div>
      </div>

      <div className="checklist-progress-bar">
        <div className="checklist-progress-fill" style={{ width: `${pct}%` }}/>
      </div>

      <div className="checklist-items">
        {items.map(i => (
          <div key={i.id} className={`checklist-item checklist-item-${i.status} ${!i.required ? 'checklist-item-optional' : ''}`}>
            <div className="checklist-item-icon">{iconFor(i.status)}</div>
            <div className="checklist-item-content">
              <span className="checklist-item-label">
                {i.label}
                {!i.required && <span className="checklist-item-optional-badge">Optional</span>}
              </span>
              {statusText(i) && <span className={`checklist-item-status checklist-status-${i.status}`}>{statusText(i)}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="checklist-footer">
        <button className="checklist-refresh-button" onClick={load} disabled={loading}>
          <IconRefresh size={16} style={{verticalAlign:'middle'}}/> Refresh
        </button>
      </div>
    </div>
  );
};
