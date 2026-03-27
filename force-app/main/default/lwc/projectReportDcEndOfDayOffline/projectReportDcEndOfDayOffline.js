import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

// Object + fields
import PPR_OBJECT from '@salesforce/schema/Polaron_Project_Report__c';

import NAME from '@salesforce/schema/Polaron_Project_Report__c.Name';
import DC_PUNCH_LIST from '@salesforce/schema/Polaron_Project_Report__c.DC_Punch_List__c';
import DC_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.DC_Complete__c';
import INSTALLED_SYSTEM_SIZE from '@salesforce/schema/Polaron_Project_Report__c.Installed_System_SizeKW__c';
import ECU_INSTALLED from '@salesforce/schema/Polaron_Project_Report__c.ECU_Installed__c';
import LAYOUT_CHANGED from '@salesforce/schema/Polaron_Project_Report__c.Layout_Changed_on_Site__c';
import INSTALL_TEAM from '@salesforce/schema/Polaron_Project_Report__c.Install_Team__c';
import ADDITIONAL_TEAM from '@salesforce/schema/Polaron_Project_Report__c.Additional_Team_Members__c';

const FIELDS = [
    NAME,
    DC_PUNCH_LIST,
    DC_COMPLETE,
    INSTALLED_SYSTEM_SIZE,
    ECU_INSTALLED,
    LAYOUT_CHANGED,
    INSTALL_TEAM,
    ADDITIONAL_TEAM
];

export default class ProjectReportDcEndOfDayOffline extends LightningElement {
    @api recordId;

    draft = {};
    isSaving = false;
    errorMessage = '';

    installTeamOptions = [];
    installTeamSelected = [];

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    @wire(getObjectInfo, { objectApiName: PPR_OBJECT })
    objectInfo;

    get defaultRecordTypeId() {
        return this.objectInfo?.data?.defaultRecordTypeId;
    }

    @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: INSTALL_TEAM })
    installTeamPicklist({ data, error }) {
        if (data) {
            this.installTeamOptions = (data.values || []).map(v => ({ label: v.label, value: v.value }));
            if (this.installTeamSelected.length === 0) {
                this.installTeamSelected = this.installTeamArray;
            }
        } else if (error) {
            // keep silent, just no options
            this.installTeamOptions = [];
        }
    }

    get hasData() {
        // show errors from getRecord (this is where your "cross-reference" error can appear)
        if (this.record?.error && !this.errorMessage) {
            this.errorMessage = this.record.error?.body?.message || this.record.error?.message || 'Load failed.';
        }
        return !!this.record?.data;
    }

    // base values
    get projectName() { return this.record.data?.fields?.Name?.value || ''; }

    get dcPunchList() { return this.record.data?.fields?.DC_Punch_List__c?.value; }
    get dcComplete() { return this.record.data?.fields?.DC_Complete__c?.value; }
    get installedSystemSize() { return this.record.data?.fields?.Installed_System_SizeKW__c?.value; }
    get ecuInstalled() { return this.record.data?.fields?.ECU_Installed__c?.value; }
    get layoutChanged() { return this.record.data?.fields?.Layout_Changed_on_Site__c?.value; }
    get installTeam() { return this.record.data?.fields?.Install_Team__c?.value || ''; }
    get additionalTeamMembers() { return this.record.data?.fields?.Additional_Team_Members__c?.value; }

    get installTeamArray() {
        if (!this.installTeam) return [];
        return this.installTeam.split(';').map(s => s.trim()).filter(Boolean);
    }

    // displayed values (draft overrides)
    get dcPunchListValue() { return this.draft.DC_Punch_List__c ?? this.dcPunchList ?? ''; }
    get dcCompleteValue() { return this.draft.DC_Complete__c ?? this.dcComplete ?? false; }
    get installedSystemSizeValue() {
        const v = this.draft.Installed_System_SizeKW__c ?? this.installedSystemSize;
        return v === null || v === undefined ? '' : v;
    }
    get ecuInstalledValue() { return this.draft.ECU_Installed__c ?? this.ecuInstalled ?? false; }
    get layoutChangedValue() { return this.draft.Layout_Changed_on_Site__c ?? this.layoutChanged ?? false; }
    get additionalTeamMembersValue() { return this.draft.Additional_Team_Members__c ?? this.additionalTeamMembers ?? ''; }

    handleTextChange(event) {
        const field = event.target.dataset.field;
        this.draft = { ...this.draft, [field]: event.target.value };
        this.errorMessage = '';
    }

    handleNumberChange(event) {
        const field = event.target.dataset.field;
        const raw = event.target.value;
        this.draft = { ...this.draft, [field]: raw === '' ? null : Number(raw) };
        this.errorMessage = '';
    }

    handleCheckboxChange(event) {
        const field = event.target.dataset.field;
        this.draft = { ...this.draft, [field]: event.target.checked };
        this.errorMessage = '';
    }

    handleInstallTeamChange(event) {
        this.installTeamSelected = event.detail.value || [];
        this.draft = { ...this.draft, Install_Team__c: this.installTeamSelected.join(';') };
        this.errorMessage = '';
    }

    handleCancel() {
        this.draft = {};
        this.errorMessage = '';
        this.dispatchEvent(new CustomEvent('close'));
    }

    async handleSave() {
        this.errorMessage = '';
        this.isSaving = true;

        try {
            const fields = { Id: this.recordId, ...this.draft };
            await updateRecord({ fields });

            this.draft = {};
            this.dispatchEvent(new CustomEvent('close'));
        } catch (e) {
            this.errorMessage = e?.body?.message || e?.message || 'Save failed.';
        } finally {
            this.isSaving = false;
        }
    }
}
