import { IInputs } from "../generated/ManifestTypes";

export interface IChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
  count?: { current: number; total: number };
  status: 'completed' | 'pending' | 'waiting' | 'blocked';
}

export interface IChecklistProps {
  maintenanceActivityId: string;
  context: ComponentFramework.Context<IInputs>;
}
