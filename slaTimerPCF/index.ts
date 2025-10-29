import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { SLATimerPCF } from "./SLATimerPCF";

export class slaTimerPCF implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private notifyOutputChanged: () => void;
    private context: ComponentFramework.Context<IInputs>;
    private container: HTMLDivElement;

    private _startDate: Date | null;
    private _slaTargetHours: number;
    private _statusCode: number;
    private _slaOutcome: number;
    private _maintenanceActivityId: string;

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary): void {
        this.context = context;
        this.notifyOutputChanged = notifyOutputChanged;
        this.container = document.createElement("div");
        context.mode.trackContainerResize(true);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     * @returns ReactElement root react element for the control
     */
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this._startDate = context.parameters.apex_startdate.raw ?? null;
        this._slaTargetHours = context.parameters.apex_slatargethours.raw ?? 0;
        this._statusCode = context.parameters.statuscode.raw ?? 0;
        this._slaOutcome = context.parameters.apex_slaoutcome.raw ?? 0;
        this._maintenanceActivityId = context.parameters.apex_maintenanceactivityid.raw ?? "";        
        this.context = context;

        return React.createElement(SLATimerPCF, {
            startDate: this._startDate,
            slaTargetHours: this._slaTargetHours,
            statusCode: this._statusCode,
            slaOutcome: this._slaOutcome,
            maintenanceActivityId: this._maintenanceActivityId,
            context: this.context
        });
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return { };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        // Add code to cleanup control if necessary
    }
}
