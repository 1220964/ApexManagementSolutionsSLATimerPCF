export function calculateSLA(startDate: Date | null, targetHours: number, currentTime: Date) {
  if (!startDate || targetHours === 0) {
    return { elapsedMs: 0, remainingMs: 0, percentageUsed: 0, isOverdue: false };
  }

  const start = new Date(startDate);
  const elapsedMs = currentTime.getTime() - start.getTime();
  const targetMs = targetHours * 3600000;
  const remainingMs = targetMs - elapsedMs;
  const percentageUsed = Math.min((elapsedMs / targetMs) * 100, 100);

  return { elapsedMs, remainingMs, percentageUsed, isOverdue: remainingMs <= 0 };
}
