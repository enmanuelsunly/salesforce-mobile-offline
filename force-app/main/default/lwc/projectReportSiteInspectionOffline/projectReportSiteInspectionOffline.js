import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import PPR_OBJECT from '@salesforce/schema/Polaron_Project_Report__c';

import NAME from '@salesforce/schema/Polaron_Project_Report__c.Name';

import SITE_INSPECTION_PATH from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Path__c';
import SCHEDULED_SITE_INSPECTION from '@salesforce/schema/Polaron_Project_Report__c.Scheduled_Site_Inspection__c';
import SITE_INSPECTION_BOOKING_STATUS from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Booking_Status__c';
import REASON_FOR_REVISIT from '@salesforce/schema/Polaron_Project_Report__c.Reason_for_Revist__c';

import REVISIT_NOTES from '@salesforce/schema/Polaron_Project_Report__c.Revisit_Notes_Site_Inspection__c';
import NOTES_FOR_SITE_INSPECTION from '@salesforce/schema/Polaron_Project_Report__c.Notes_for_Site_Inspection__c';

import SI_STRUCTURAL_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Structural_Complete__c';
import SI_ELECTRICAL_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Electrical_Complete__c';
import SI_DRONE_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Drone_Complete__c';
import SI_ADDITIONAL_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Additional_Complete__c';

import SITE_INSPECTION_UPLOADED from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Uploaded__c';
import SITE_INSPECTION_GOOGLE from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Google__c';
import SITE_INSPECTION_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Complete__c';

const FIELDS = [
  NAME,
  SITE_INSPECTION_PATH,
  SCHEDULED_SITE_INSPECTION,
  SITE_INSPECTION_BOOKING_STATUS,
  REASON_FOR_REVISIT,
  REVISIT_NOTES,
  NOTES_FOR_SITE_INSPECTION,
  SI_STRUCTURAL_COMPLETE,
  SI_ELECTRICAL_COMPLETE,
  SI_DRONE_COMPLETE,
  SI_ADDITIONAL_COMPLETE,
  SITE_INSPECTION_UPLOADED,
  SITE_INSPECTION_GOOGLE,
  SITE_INSPECTION_COMPLETE
];

export default class ProjectReportSiteInspectionOffline extends LightningElement {
  @api recordId;

  draft = {};
  isSaving = false;
  errorMessage = '';

  siteInspectionPathOptions = [];
  bookingStatusOptions = [];
  reasonForRevisitOptions = [];

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  record;

  @wire(getObjectInfo, { objectApiName: PPR_OBJECT })
  objectInfo;

  get defaultRecordTypeId() {
    return this.objectInfo?.data?.defaultRecordTypeId;
  }

  // Picklists (no hardcoding)
  @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: SITE_INSPECTION_PATH })
  siteInspectionPathPicklist({ data, error }) {
    this.siteInspectionPathOptions = data ? (data.values || []).map(v => ({ label: v.label, value: v.value })) : [];
  }

  @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: SITE_INSPECTION_BOOKING_STATUS })
  bookingStatusPicklist({ data, error }) {
    this.bookingStatusOptions = data ? (data.values || []).map(v => ({ label: v.label, value: v.value })) : [];
  }

  @wire(getPicklistValues, { recordTypeId: '$defaultRecordTypeId', fieldApiName: REASON_FOR_REVISIT })
  reasonForRevisitPicklist({ data, error }) {
    this.reasonForRevisitOptions = data ? (data.values || []).map(v => ({ label: v.label, value: v.value })) : [];
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

  // Base values
  get projectName() { return this.record.data?.fields?.Name?.value || ''; }

  // Formula link
  get siteInspectionGoogle() {
    return this.record.data?.fields?.Site_Inspection_Google__c?.value || '';
  }

  // Draft override helpers
  fieldValue(apiName, fallback) {
    return this.draft[apiName] ?? fallback;
  }

  get siteInspectionPathValue() {
    return this.fieldValue('Site_Inspection_Path__c', this.record.data?.fields?.Site_Inspection_Path__c?.value || '');
  }

  get scheduledSiteInspectionValue() {
    // Date fields want YYYY-MM-DD (UI API usually gives that)
    return this.fieldValue('Scheduled_Site_Inspection__c', this.record.data?.fields?.Scheduled_Site_Inspection__c?.value || '');
  }

  get bookingStatusValue() {
    return this.fieldValue('Site_Inspection_Booking_Status__c', this.record.data?.fields?.Site_Inspection_Booking_Status__c?.value || '');
  }

  get reasonForRevisitValue() {
    return this.fieldValue('Reason_for_Revist__c', this.record.data?.fields?.Reason_for_Revist__c?.value || '');
  }

  get revisitNotesValue() {
    return this.fieldValue('Revisit_Notes_Site_Inspection__c', this.record.data?.fields?.Revisit_Notes_Site_Inspection__c?.value || '');
  }

  get notesForSiteInspectionValue() {
    return this.fieldValue('Notes_for_Site_Inspection__c', this.record.data?.fields?.Notes_for_Site_Inspection__c?.value || '');
  }

  get siStructuralCompleteValue() {
    return this.fieldValue('SI_Structural_Complete__c', this.record.data?.fields?.SI_Structural_Complete__c?.value || false);
  }
  get siElectricalCompleteValue() {
    return this.fieldValue('SI_Electrical_Complete__c', this.record.data?.fields?.SI_Electrical_Complete__c?.value || false);
  }
  get siDroneCompleteValue() {
    return this.fieldValue('SI_Drone_Complete__c', this.record.data?.fields?.SI_Drone_Complete__c?.value || false);
  }
  get siAdditionalCompleteValue() {
    return this.fieldValue('SI_Additional_Complete__c', this.record.data?.fields?.SI_Additional_Complete__c?.value || false);
  }

  get siteInspectionUploadedValue() {
    return this.fieldValue('Site_Inspection_Uploaded__c', this.record.data?.fields?.Site_Inspection_Uploaded__c?.value || false);
  }

  get siteInspectionCompleteValue() {
    return this.fieldValue('Site_Inspection_Complete__c', this.record.data?.fields?.Site_Inspection_Complete__c?.value || false);
  }

  // Handlers
  handlePicklistChange(event) {
    const field = event.target.dataset.field;
    this.draft = { ...this.draft, [field]: event.detail.value };
    this.errorMessage = '';
  }

  handleDateChange(event) {
    const field = event.target.dataset.field;
    this.draft = { ...this.draft, [field]: event.target.value };
    this.errorMessage = '';
  }

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
