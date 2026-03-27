import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import { updateRecord, createRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import OFFLINE_EVENT_OBJECT from '@salesforce/schema/Offline_Event__c';
import EVENT_OBJECT from '@salesforce/schema/Event';

// Offline_Event__c fields
import SUBJECT from '@salesforce/schema/Offline_Event__c.Subject__c';
import LOCATION from '@salesforce/schema/Offline_Event__c.Location__c';
import DESCRIPTION from '@salesforce/schema/Offline_Event__c.Description__c';
import START from '@salesforce/schema/Offline_Event__c.Start__c';
import END from '@salesforce/schema/Offline_Event__c.End__c';
import MEETING_TYPE from '@salesforce/schema/Offline_Event__c.Meeting_Type__c';
import RELATED_TO_ID from '@salesforce/schema/Offline_Event__c.Related_To_Id__c';
import RELATED_TO_NAME from '@salesforce/schema/Offline_Event__c.Related_To_Name__c';
import EVENT_ID from '@salesforce/schema/Offline_Event__c.Event_Id__c';

// Event fields (sync)
import E_SUBJECT from '@salesforce/schema/Event.Subject';
import E_LOCATION from '@salesforce/schema/Event.Location';
import E_DESCRIPTION from '@salesforce/schema/Event.Description';
import E_START from '@salesforce/schema/Event.StartDateTime';
import E_END from '@salesforce/schema/Event.EndDateTime';
import E_TYPE from '@salesforce/schema/Event.Type';
import E_WHATID from '@salesforce/schema/Event.WhatId';

const FIELDS = [
  SUBJECT, LOCATION, DESCRIPTION, START, END, MEETING_TYPE,
  RELATED_TO_ID, RELATED_TO_NAME, EVENT_ID
];

export default class ViewOfflineEventOffline extends LightningElement {
  @api recordId;

  selected = 'details';
  draft = {};
  errorMessage = '';
  isSaving = false;
  isPushing = false;

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  rec;

  @wire(getObjectInfo, { objectApiName: OFFLINE_EVENT_OBJECT })
  objInfo;

  get recordTypeId() {
    return this.objInfo?.data?.defaultRecordTypeId;
  }

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: MEETING_TYPE })
  meetingTypePick;

  get hasData() {
    return !!this.rec?.data;
  }

  // --- values (draft overrides) ---
  val(field) {
    return this.draft[field] ?? (getFieldValue(this.rec.data, field) || '');
  }

  get subjectValue() { return this.draft.Subject__c ?? (getFieldValue(this.rec.data, SUBJECT) || ''); }
  get locationValue() { return this.draft.Location__c ?? (getFieldValue(this.rec.data, LOCATION) || ''); }
  get descriptionValue() { return this.draft.Description__c ?? (getFieldValue(this.rec.data, DESCRIPTION) || ''); }
  get startValue() { return this.draft.Start__c ?? (getFieldValue(this.rec.data, START) || ''); }
  get endValue() { return this.draft.End__c ?? (getFieldValue(this.rec.data, END) || ''); }
  get meetingTypeValue() { return this.draft.Meeting_Type__c ?? (getFieldValue(this.rec.data, MEETING_TYPE) || ''); }
  get relatedToIdValue() { return this.draft.Related_To_Id__c ?? (getFieldValue(this.rec.data, RELATED_TO_ID) || ''); }
  get relatedToNameValue() { return this.draft.Related_To_Name__c ?? (getFieldValue(this.rec.data, RELATED_TO_NAME) || ''); }
  get eventIdValue() { return this.draft.Event_Id__c ?? (getFieldValue(this.rec.data, EVENT_ID) || ''); }

  // display helpers
  formatDateTime(val) {
    if (!val) return '—';
    try { return new Date(val).toLocaleString(); } catch (e) { return val; }
  }
  get startText() { return this.formatDateTime(this.startValue); }
  get endText() { return this.formatDateTime(this.endValue); }

  get meetingTypeOptions() {
    const vals = this.meetingTypePick?.data?.values || [];
    return [{ label: '--None--', value: '' }, ...vals.map(v => ({ label: v.label, value: v.value }))];
  }

  get meetingTypeLabel() {
    const display = getFieldDisplayValue(this.rec.data, MEETING_TYPE);
    if (display) return display;

    const opts = this.meetingTypePick?.data?.values || [];
    const found = opts.find(o => o.value === this.meetingTypeValue);
    return found?.label || this.meetingTypeValue || '—';
  }

  // --- tab states ---
  tileClass(section) { return this.selected === section ? 'tile active' : 'tile'; }
  get detailsBtnClass() { return this.tileClass('details'); }
  get timingBtnClass() { return this.tileClass('timing'); }
  get notesBtnClass() { return this.tileClass('notes'); }
  get syncBtnClass() { return this.tileClass('sync'); }

  get isDetails() { return this.selected === 'details'; }
  get isTiming() { return this.selected === 'timing'; }
  get isNotes() { return this.selected === 'notes'; }
  get isSync() { return this.selected === 'sync'; }

  openDetails() { this.selected = 'details'; }
  openTiming() { this.selected = 'timing'; }
  openNotes() { this.selected = 'notes'; }
  openSync() { this.selected = 'sync'; }

  // --- handlers ---
  handleInputChange(event) {
    const field = event.target.dataset.field;
    this.draft = { ...this.draft, [field]: event.target.value };
  }

  handlePicklistChange(event) {
    const field = event.target.dataset.field;
    this.draft = { ...this.draft, [field]: event.detail.value };
  }

  handleCancel() {
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

  // Sync: create if Event_Id__c blank, else update that Event
  async handlePushToEvent() {
    this.errorMessage = '';
    this.isPushing = true;

    try {
      const whatId = this.relatedToIdValue || null;
      const fields = {
        Subject: this.subjectValue || null,
        Location: this.locationValue || null,
        Description: this.descriptionValue || null,
        StartDateTime: this.startValue || null,
        EndDateTime: this.endValue || null,
        Type: this.meetingTypeValue || null,
        WhatId: whatId
      };

      let eventId = this.eventIdValue;

      if (eventId) {
        // update existing Event
        await updateRecord({ fields: { Id: eventId, ...fields } });
      } else {
        // create new Event
        const recordInput = {
          apiName: EVENT_OBJECT.objectApiName,
          fields
        };
        const created = await createRecord(recordInput);
        eventId = created.id;

        // store back to Offline_Event__c for future updates
        await updateRecord({ fields: { Id: this.recordId, Event_Id__c: eventId } });
      }
    } catch (e) {
      this.errorMessage =
        e?.body?.message ||
        e?.message ||
        'Push to Event failed (needs internet + access).';
    } finally {
      this.isPushing = false;
    }
  }
}
