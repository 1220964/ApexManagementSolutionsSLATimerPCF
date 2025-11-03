/**
 * Taking the start date, total SLA duration (hours), and current time, this calculates: 1. how much time has passed, 2. how much time is left, 3. what percentage of the SLA window has been used, 4. if the SLA has been breached (isOverdue)
 * Returns all values in milliseconds for precision
 */
export function calculateSLA(startDate: Date | null, targetHours: number, currentTime: Date) {
  if (!startDate || targetHours <= 0 || targetHours === 0) {
    return { elapsedMs: 0, remainingMs: 0, percentageUsed: 0, isOverdue: false };
  }

  const elapsedMs = currentTime.getTime() - startDate.getTime();  //since sla started
  const targetMs = targetHours * 3600000; //total sla window in ms
  const remainingMs = targetMs - elapsedMs; //time left before sla deadline
  const percentageUsed = Math.min((elapsedMs / targetMs) * 100, 100); 

  return { elapsedMs, remainingMs, percentageUsed, isOverdue: remainingMs <= 0 };
}