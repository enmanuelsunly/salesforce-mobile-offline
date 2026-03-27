import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import EVENT_OBJECT from '@salesforce/schema/Event';

// Fields
import WHAT_ID from '@salesforce/schema/Event.WhatId';
import SUBJECT from '@salesforce/schema/Event.Subject';
import TYPE from '@salesforce/schema/Event.Type';
import START from '@salesforce/schema/Event.StartDateTime';
import END from '@salesforce/schema/Event.EndDateTime';
import DESCRIPTION from '@salesforce/schema/Event.Description';
import LOCATION from '@salesforce/schema/Event.Location';

const FIELDS = [WHAT_ID, SUBJECT, TYPE, START, END, DESCRIPTION, LOCATION];

export default class ViewEventOffline extends LightningElement {
  @api recordId;

  selected = 'details';
  errorMessage = '';

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  eventRec;

  @wire(getObjectInfo, { objectApiName: EVENT_OBJECT })
  eventInfo;

  get recordTypeId() {
    // Event usually uses the master record type, but we still do it safely
    return this.eventInfo?.data?.defaultRecordTypeId;
  }

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: TYPE })
  typePick;

  get hasData() {
    return !!this.eventRec?.data;
  }

  // Basic values
  get subject() {
    return getFieldValue(this.eventRec.data, SUBJECT) || '';
  }

  get location() {
    return getFieldValue(this.eventRec.data, LOCATION) || '';
  }

  get description() {
    return getFieldValue(this.eventRec.data, DESCRIPTION) || '';
  }

  get startRaw() {
    return getFieldValue(this.eventRec.data, START);
  }

  get endRaw() {
    return getFieldValue(this.eventRec.data, END);
  }

  // DateTime display (simple, consistent)
  formatDateTime(val) {
    if (!val) return '';
    try {
      const d = new Date(val);
      return d.toLocaleString();
    } catch (e) {
      return val;
    }
  }

  get startText() {
    return this.formatDateTime(this.startRaw);
  }

  get endText() {
    return this.formatDateTime(this.endRaw);
  }

  // Picklist label for Type
  get meetingTypeValue() {
    return getFieldValue(this.eventRec.data, TYPE) || '';
  }

  get meetingTypeLabel() {
    const display = getFieldDisplayValue(this.eventRec.data, TYPE);
    if (display) return display;

    const opts = this.typePick?.data?.values || [];
    const found = opts.find(o => o.value === this.meetingTypeValue);
    return found?.label || this.meetingTypeValue || '—';
  }

  // Related To (WhatId) display value if available, else Id
  get relatedToId() {
    return getFieldValue(this.eventRec.data, WHAT_ID) || '';
  }

  get relatedToDisplay() {
    // UI API sometimes provides displayValue for lookups
    const display = getFieldDisplayValue(this.eventRec.data, WHAT_ID);
    return display || this.relatedToId || '—';
  }

  // Tabs/sections
  tileClass(section) {
    return this.selected === section ? 'tile active' : 'tile';
  }

  get detailsBtnClass() { return this.tileClass('details'); }
  get timingBtnClass() { return this.tileClass('timing'); }
  get notesBtnClass() { return this.tileClass('notes'); }

  get isDetails() { return this.selected === 'details'; }
  get isTiming() { return this.selected === 'timing'; }
  get isNotes() { return this.selected === 'notes'; }

  openDetails() { this.selected = 'details'; }
  openTiming() { this.selected = 'timing'; }
  openNotes() { this.selected = 'notes'; }
}
