import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import TRENCHING_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.Trenching_Complete__c';

import PPR_OBJECT from '@salesforce/schema/Polaron_Project_Report__c';

import NAME from '@salesforce/schema/Polaron_Project_Report__c.Name';
import AC_PUNCH_LIST from '@salesforce/schema/Polaron_Project_Report__c.AC_Punch_List__c';
import AC_FOLDER from '@salesforce/schema/Polaron_Project_Report__c.AC_Folder__c';
import SERVICE_ORDER_NUMBER from '@salesforce/schema/Polaron_Project_Report__c.Service_Order_Number__c';
import ELECTRICAL_PERMIT from '@salesforce/schema/Polaron_Project_Report__c.Electrical_Permit__c';
import ELECTRICIAN_NOTES from '@salesforce/schema/Polaron_Project_Report__c.Electrician_Notes__c';
import INSTALL_TEAM from '@salesforce/schema/Polaron_Project_Report__c.Install_Team__c';
import ADDITIONAL_TEAM_MEMBERS from '@salesforce/schema/Polaron_Project_Report__c.Additional_Team_Members__c';
import TRENCHING_REQUIRED from '@salesforce/schema/Polaron_Project_Report__c.Trenching_Required__c';

const FIELDS = [
  NAME,
  AC_PUNCH_LIST,
  AC_FOLDER,
  SERVICE_ORDER_NUMBER,
  ELECTRICAL_PERMIT,
  ELECTRICIAN_NOTES,
  INSTALL_TEAM,
  ADDITIONAL_TEAM_MEMBERS,
  TRENCHING_REQUIRED,
  TRENCHING_COMPLETE
];

export default class ProjectReportAcEndOfDayOffline extends LightningElement {
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
      this.installTeamOptions = [];
    }
  }

  get hasData() {
    if (this.record?.error && !this.errorMessage) {
      this.errorMessage =
        this.record.error?.body?.message ||
        this.record.error?.message ||
        'Load failed.';
    }
    return !!this.record?.data;
  }

  get trenchingCompleteValue() {
  return this.draft.Trenching_Complete__c ??
    (this.record.data?.fields?.Trenching_Complete__c?.value || false);
}


  // Base values
  get projectName() { return this.record.data?.fields?.Name?.value || ''; }

  get acFolder() { return this.record.data?.fields?.AC_Folder__c?.value || ''; }

  get installTeam() { return this.record.data?.fields?.Install_Team__c?.value || ''; }
  get installTeamArray() {
    if (!this.installTeam) return [];
    return this.installTeam.split(';').map(s => s.trim()).filter(Boolean);
  }

  // Draft override getters
  get acPunchListValue() {
    return this.draft.AC_Punch_List__c ?? (this.record.data?.fields?.AC_Punch_List__c?.value || '');
  }

  get serviceOrderNumberValue() {
    return this.draft.Service_Order_Number__c ?? (this.record.data?.fields?.Service_Order_Number__c?.value || '');
  }

  get electricalPermitValue() {
    return this.draft.Electrical_Permit__c ?? (this.record.data?.fields?.Electrical_Permit__c?.value || '');
  }

  get electricianNotesValue() {
    return this.draft.Electrician_Notes__c ?? (this.record.data?.fields?.Electrician_Notes__c?.value || '');
  }

  get additionalTeamMembersValue() {
    return this.draft.Additional_Team_Members__c ?? (this.record.data?.fields?.Additional_Team_Members__c?.value || '');
  }

  get trenchingRequiredValue() {
    return this.draft.Trenching_Required__c ?? (this.record.data?.fields?.Trenching_Required__c?.value || false);
  }

  // Handlers
  handleTextChange(event) {
    const field = event.target.dataset.field;
    this.draft = { ...this.draft, [field]: event.target.value };
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
