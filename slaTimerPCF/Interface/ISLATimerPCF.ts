import { IInputs } from "../generated/ManifestTypes";

export interface ISLATimerPCFProps {
    startDate: Date | null;
    slaTargetHours: number;
    statusCode: number;
    slaOutcome: number;
    maintenanceActivityId: string,
    context: ComponentFramework.Context<IInputs>;
}
