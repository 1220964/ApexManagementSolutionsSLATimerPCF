import * as React from 'react';
import { Label, Tooltip } from '@fluentui/react-components';
import { useEffect, useState } from "react";
import { ISLATimerPCFProps } from './Interface/ISLATimerPCF';
import { Spinner } from '@fluentui/react-components';
import { IconClock, IconAlertTriangle, IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { calculateSLA } from './calculateSLATimerFunctions';
import { ChecklistProgress } from '../ChecklistProgress';

const STATUS = {
  IN_PROGRESS: 455220001,
  COMPLETED: 2
}

export const SLATimerPCF: React.FC<ISLATimerPCFProps> = ({ startDate, slaTargetHours, statusCode, slaOutcome, maintenanceActivityId, context }) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const warningThreshold = 90;
  const criticalThreshold = 100;

  const isCompleted = (code: number) => code === STATUS.COMPLETED;

  useEffect(() => {
    setIsLoading(false);
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, [context, slaOutcome]);

  const base = calculateSLA(startDate, slaTargetHours, currentTime);
  const timeInfo = {
    elapsedMs: base.elapsedMs,
    remainingMs: base.remainingMs,
    percentageUsed: base.percentageUsed,
    isOverdue: base.isOverdue,
    targetMs: (slaTargetHours || 0) * 3600000,
    isCompleted: isCompleted(statusCode)
  };

  //connvert ms -> hh:mm:ss
  const formatTime = (ms: number): string => {
    const absMs = Math.abs(ms);
    const hours = Math.floor(absMs / 3600000);
    const minutes = Math.floor((absMs % 3600000) / 60000);
    const seconds = Math.floor((absMs % 60000) / 1000);
    return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  };

  const getStatusColor = (percentage: number, isOverdue: boolean, completed: boolean): string => {
    if (completed) return 'completed';
    if (isOverdue) return 'violated';
    if (percentage >= criticalThreshold) return 'critical';
    if (percentage >= warningThreshold) return 'warning';
    return 'good';
  };

  const getStatusText = (percentage: number, isOverdue: boolean, completed: boolean): string => {
    if (completed) return 'Completed';
    if (isOverdue) return 'SLA Violated';
    if (percentage >= criticalThreshold) return 'Critical';
    if (percentage >= warningThreshold) return 'Warning';
    return 'On Track';
  };

  const getStatusIcon = (percentage: number, isOverdue: boolean, completed: boolean) => {
    if (completed) return <IconCircleCheck stroke={2} color="#107c10" className="status-icon" />;
    if (isOverdue) return <IconCircleX stroke={2} color="#a4262c" className="status-icon" />;
    if (percentage >= criticalThreshold) return <IconAlertTriangle stroke={2} color="#d13438" className="status-icon" />;
    if (percentage >= warningThreshold) return <IconAlertTriangle stroke={2} color="#ff8c00" className="status-icon" />;
    return <IconCircleCheck stroke={2} color="#107c10" className="status-icon" />;
  };

  const statusColor = getStatusColor(timeInfo.percentageUsed, timeInfo.isOverdue, timeInfo.isCompleted);

  if (isLoading) {
    return (
      <div className="sla-loading-container">
        <Spinner className="sla-loading-icon" />
        <span className="sla-loading-text">Loading SLA Timer...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="sla-loading-container">
        <IconCircleX className="sla-loading-icon" stroke={2} color="#C91432" />
        <span className="sla-error-text">Unable to load SLA Timer</span>
      </div>
    );
  }

  //sla not active if activity hasn't started yet
  if (statusCode !== STATUS.IN_PROGRESS) {
    return (
      <div className="sla-timer-container">
        <div className="sla-not-started">
          <IconClock stroke={2} className="sla-clock-icon" />
          <div className="sla-not-started-text">SLA Timer not active</div>
          <div className="sla-not-started-subtext">
            Start the maintenance activity to begin tracking SLA.
          </div>
        </div>
      </div>
    );
  }  

  //show placeholder if start date or target hours are not set yet
  if (!startDate || slaTargetHours === 0) {
    return (
      <div className="sla-timer-container">
        <div className="sla-not-started">
          <IconClock stroke={2} className="sla-clock-icon" />
          <div className="sla-not-started-text">SLA Not Started</div>
          <div className="sla-not-started-subtext">
            {!startDate && "Start date not set"}
            {!slaTargetHours && startDate && "Target hours not set"}
          </div>
        </div>
      </div>
    );
  }

  //main container displays: status badge, countdown timer, progress bar, details
  return (
    // <div className="sla-sections">
    <div className="sla-timer-container">
      <div className={`sla-timer-card sla-${statusColor}`}>
        <div className="sla-header">
          <div className={`sla-status-badge tooltip`}>
            {getStatusIcon(timeInfo.percentageUsed, timeInfo.isOverdue, timeInfo.isCompleted)}
            <span className="sla-status-text">
              {getStatusText(timeInfo.percentageUsed, timeInfo.isOverdue, timeInfo.isCompleted)}
            </span>

            <span className="tooltip-text" role="tooltip" aria-hidden="true">
              {"The SLA limit is automatically calculated from the activity's priority level."}
            </span>
          </div>
        </div>

          <div className="sla-timer-display">
            {timeInfo.isCompleted ? (
              <div className="sla-completed-display">
                <div className="sla-time-value">COMPLETED</div>
                <div className="sla-time-label">Activity Finished</div>
              </div>
            ) : timeInfo.isOverdue ? (
              <>
                <div className="sla-time-label">OVERDUE BY</div>
                <div className="sla-time-value sla-overdue-pulse">
                  {formatTime(Math.abs(timeInfo.remainingMs))}
                </div>
              </>
            ) : (
              <>
                <div className="sla-time-value">{formatTime(timeInfo.remainingMs)}</div>
                <div className="sla-time-label">Time Remaining</div>
              </>
            )}
          </div>

          {!timeInfo.isCompleted && (
            <div className="sla-progress-container">
              <div className="sla-progress-bar">
                <div
                  className={`sla-progress-fill sla-progress-${statusColor}`}
                  style={{ width: `${timeInfo.percentageUsed}%` }}
                />
              </div>
              <div className="sla-progress-text">
                {timeInfo.percentageUsed.toFixed(1)}% of time used
              </div>
            </div>
          )}

          <div className="sla-details">
            <div className="sla-detail-row">
              <span className="sla-detail-label">Elapsed Time</span>
              <span className="sla-detail-value">{formatTime(timeInfo.elapsedMs)}</span>
            </div>
            <div className="sla-detail-row">
              <span className="sla-detail-label">Target Time</span>
              <span className="sla-detail-value">{slaTargetHours}h</span>
            </div>
            {timeInfo.isCompleted && slaOutcome && (
              <div className="sla-detail-row">
                <span className="sla-detail-label">Outcome</span>
                <span className="sla-detail-value">
                  {slaOutcome === 1 ? 'Met' : 'Violated'}
                </span>
              </div>
            )}
          </div>
      </div>
    </div>


      /* <div className="checklist-card">
        <ChecklistProgress
          maintenanceActivityId={maintenanceActivityId}
          context={context}
        />        
      </div>
    </div> */
  );
};