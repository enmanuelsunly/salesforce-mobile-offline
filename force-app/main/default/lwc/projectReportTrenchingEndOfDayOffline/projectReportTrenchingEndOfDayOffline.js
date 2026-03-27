import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

import NAME from '@salesforce/schema/Polaron_Project_Report__c.Name';

import PILES_INSTALLED from '@salesforce/schema/Polaron_Project_Report__c.of_Piles_Installed__c';
import PRE_PILE_LAYOUT_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.Pre_Pile_Layout_Complete__c';
import PILE_INSTALLATION_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.Pile_Installation_Complete__c';
import TRENCHING_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.Trenching_Complete__c';
import TRENCH_NOTES from '@salesforce/schema/Polaron_Project_Report__c.Trench_Notes__c';
import TRENCH_LENGTH from '@salesforce/schema/Polaron_Project_Report__c.Trench_Length__c';
import INSTALL_FOLDER from '@salesforce/schema/Polaron_Project_Report__c.Install_Folder__c';

const FIELDS = [
  NAME,
  PILES_INSTALLED,
  PRE_PILE_LAYOUT_COMPLETE,
  PILE_INSTALLATION_COMPLETE,
  TRENCHING_COMPLETE,
  TRENCH_NOTES,
  TRENCH_LENGTH,
  INSTALL_FOLDER
];

export default class ProjectReportTrenchingEndOfDayOffline extends LightningElement {
  @api recordId;

  draft = {};
  isSaving = false;
  errorMessage = '';

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  record;

  get hasData() {
    if (this.record?.error && !this.errorMessage) {
      this.errorMessage =
        this.record.error?.body?.message ||
        this.record.error?.message ||
        'Load failed.';
    }
    return !!this.record?.data;
  }

  // Base values
  get projectName() { return this.record.data?.fields?.Name?.value || ''; }

  get installFolder() { return this.record.data?.fields?.Install_Folder__c?.value || ''; }

  // Draft override getters
  get pilesInstalledValue() {
    const v = this.draft.of_Piles_Installed__c ?? this.record.data?.fields?.of_Piles_Installed__c?.value;
    return v === null || v === undefined ? '' : v;
  }

  get prePileLayoutCompleteValue() {
    return this.draft.Pre_Pile_Layout_Complete__c ??
      (this.record.data?.fields?.Pre_Pile_Layout_Complete__c?.value || false);
  }

  get pileInstallationCompleteValue() {
    return this.draft.Pile_Installation_Complete__c ??
      (this.record.data?.fields?.Pile_Installation_Complete__c?.value || false);
  }

  get trenchingCompleteValue() {
    return this.draft.Trenching_Complete__c ??
      (this.record.data?.fields?.Trenching_Complete__c?.value || false);
  }

  get trenchNotesValue() {
    return this.draft.Trench_Notes__c ??
      (this.record.data?.fields?.Trench_Notes__c?.value || '');
  }

  get trenchLengthValue() {
    return this.draft.Trench_Length__c ??
      (this.record.data?.fields?.Trench_Length__c?.value || '');
  }

  // Handlers
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
