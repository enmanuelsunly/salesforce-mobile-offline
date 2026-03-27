import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

// Only valid Event fields – NO cross-object fields here
import SUBJECT_FIELD from '@salesforce/schema/Event.Subject';
import START_FIELD from '@salesforce/schema/Event.StartDateTime';
import END_FIELD from '@salesforce/schema/Event.EndDateTime';
import WHAT_FIELD from '@salesforce/schema/Event.WhatId';

const FIELDS = [SUBJECT_FIELD, START_FIELD, END_FIELD, WHAT_FIELD];

export default class EventOffline extends LightningElement {
    @api recordId;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredEvent;

    // State helpers
    get hasData() {
        return this.wiredEvent && this.wiredEvent.data;
    }

    get hasError() {
        return this.wiredEvent && this.wiredEvent.error;
    }

    // Surface a readable error message so we can see what's wrong
    get errorMessage() {
        const error = this.wiredEvent && this.wiredEvent.error;
        if (!error) return '';

        if (Array.isArray(error.body)) {
            return error.body.map(e => e.message).join('\n');
        }
        if (error.body && typeof error.body.message === 'string') {
            return error.body.message;
        }
        return JSON.stringify(error, null, 2);
    }

    // Field getters
    get subject() {
        return this.hasData ? getFieldValue(this.wiredEvent.data, SUBJECT_FIELD) : null;
    }

    get startDate() {
        return this.hasData ? getFieldValue(this.wiredEvent.data, START_FIELD) : null;
    }

    get endDate() {
        return this.hasData ? getFieldValue(this.wiredEvent.data, END_FIELD) : null;
    }

    get whatId() {
        return this.hasData ? getFieldValue(this.wiredEvent.data, WHAT_FIELD) : null;
    }
}
