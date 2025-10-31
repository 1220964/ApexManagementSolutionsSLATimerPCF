import { IChecklistItem } from "./slaTimerPCF/Interface/IChecklistItem";

export async function fetchChecklistData(
  maintenanceActivityId: string,
  context: ComponentFramework.Context<any>
): Promise<IChecklistItem[]> {
  if (!maintenanceActivityId) return getDefaultChecklist();

  const act = await context.webAPI.retrieveRecord(
    'apex_maintenanceactivity',
    maintenanceActivityId,
    '?$select=apex_activitydescription,apex_actualcost,apex_assignedtechnician,apex_slaoutcome,statuscode'
  );

  const annos = await context.webAPI.retrieveMultipleRecords(
    'annotation',
    `?$select=annotationid,filename,isdocument&$filter=isdocument eq true and _objectid_value eq ${encodeURIComponent(maintenanceActivityId)}`
  );

  let reqApproved: boolean | null = null;
  try {
    const rel = await context.webAPI.retrieveRecord(
      'apex_maintenanceactivity',
      maintenanceActivityId,
      '?$select=_apex_maintenancerequestid_value'
    );
    if (rel._apex_maintenancerequestid_value) {
      const req = await context.webAPI.retrieveRecord(
        'apex_maintenancerequest',
        rel._apex_maintenancerequestid_value,
        '?$select=apex_approved'
      );
      reqApproved = !!req.apex_approved;
    }
  } catch {
    
  }

  return buildChecklist(act, annos?.entities ?? [], reqApproved);
}

function buildChecklist(
  act: any,
  annotations: any[],
  reqApproved: boolean | null
): IChecklistItem[] {
  const photoCount = annotations.length;
  const hasPhotos = photoCount >= 1;
  const hasDesc   = typeof act.apex_activitydescription === 'string' && act.apex_activitydescription.trim().length > 10;
  const hasTech   = !!act.apex_assignedtechnician;
  const hasCost   = act.apex_actualcost !== null && act.apex_actualcost !== undefined;

  // If cost exists and is >100, it requires approval; otherwise show waiting/blocked sensibly
  const approvalRequired = hasCost && Number(act.apex_actualcost) > 100;
  const approvalCompleted = !!reqApproved;
  const approvalStatus: IChecklistItem['status'] =
    approvalRequired ? (approvalCompleted ? 'completed' : 'waiting') : (hasCost ? 'pending' : 'blocked');

  return [
    { id: 'photos', label: 'Photos uploaded', completed: hasPhotos, required: true,
      count: { current: photoCount, total: 3 }, status: hasPhotos ? 'completed' : 'pending' },
    { id: 'description', label: 'Activity description', completed: hasDesc, required: true,
      status: hasDesc ? 'completed' : 'pending' },
    { id: 'technician', label: 'Technician assigned', completed: hasTech, required: true,
      status: hasTech ? 'completed' : 'pending' },
    { id: 'cost', label: 'Cost documented', completed: hasCost, required: true,
      status: hasCost ? 'completed' : 'pending' },
    { id: 'approval', label: 'Cost approval', completed: approvalCompleted, required: approvalRequired,
      status: approvalStatus },
   
    { id: 'inspection', label: 'Final inspection', completed: false, required: true,
      status: (hasPhotos && hasDesc && hasTech && (!approvalRequired || approvalCompleted)) ? 'pending' : 'blocked' },
  ];
}

function getDefaultChecklist(): IChecklistItem[] {
  return [
    { id: 'photos', label: 'Photos uploaded', completed: false, required: true, count: { current: 0, total: 3 }, status: 'pending' },
    { id: 'description', label: 'Activity description', completed: false, required: true, status: 'pending' },
    { id: 'technician', label: 'Technician assigned', completed: false, required: true, status: 'pending' },
    { id: 'cost', label: 'Cost documented', completed: false, required: true, status: 'pending' },
    { id: 'approval', label: 'Cost approval', completed: false, required: false, status: 'blocked' },
    { id: 'inspection', label: 'Final inspection', completed: false, required: true, status: 'blocked' },
  ];
}

export function calculateCompletionPercentage(items: IChecklistItem[]): number {
  const req = items.filter(i => i.required);
  if (!req.length) return 0;
  const done = req.filter(i => i.completed).length;
  return Math.round((done / req.length) * 100);
}
