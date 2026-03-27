import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

import LOST_REASON_FIELD from '@salesforce/schema/Account.Lost_Reasons__c';
import LOST_DATE_FIELD from '@salesforce/schema/Account.Lost_Date__c';

const FIELDS = [LOST_REASON_FIELD, LOST_DATE_FIELD];

export default class AccountMarkLostOffline extends LightningElement {
    @api recordId;

    draft = {};
    isSaving = false;
    errorMessage = '';

    // Local-only text area (since you did not provide an API name for Lost Details)
    lostDetailsLocal = '';

    // Load existing values (online + cached if available)
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    // Needed to fetch picklist values dynamically
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo;

    get recordTypeId() {
        return this.objectInfo?.data?.defaultRecordTypeId;
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: LOST_REASON_FIELD })
    lostReasonPicklist;

    // ---- current values from record ----
    get f() {
        return this.record?.data?.fields || {};
    }

    get lostReason() {
        return this.f.Lost_Reasons__c?.value;
    }

    get lostDate() {
        return this.f.Lost_Date__c?.value;
    }

    // ---- displayed values (draft overrides) ----
    get lostReasonValue() {
        return this.draft.Lost_Reasons__c ?? this.lostReason ?? '';
    }

    get lostDateValue() {
        return this.draft.Lost_Date__c ?? this.lostDate ?? '';
    }

    // ---- picklist options (NOT hard-coded) ----
    get lostReasonOptions() {
        const values = this.lostReasonPicklist?.data?.values || [];
        return [{ label: '--None--', value: '' }].concat(
            values.map(v => ({ label: v.label, value: v.value }))
        );
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.draft = { ...this.draft, [name]: value };
        this.errorMessage = '';
    }

    handleLocalChange(event) {
        this.lostDetailsLocal = event.target.value;
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    async handleSave() {
        this.isSaving = true;
        this.errorMessage = '';

        try {
            if (!this.lostReasonValue || !this.lostDateValue) {
                this.errorMessage = 'Please complete all required fields.';
                this.isSaving = false;
                return;
            }

            const fields = {
                Id: this.recordId,
                ...this.draft
            };

            // NOTE: Lost Details is currently NOT saved because you didn’t give the field API name.
            // If you provide it (ex: Lost_Details__c), we’ll add it to FIELDS + updateRecord.

            await updateRecord({ fields });

            this.draft = {};
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Saved',
                    message: 'Marked as Lost.',
                    variant: 'success'
                })
            );

            this.dispatchEvent(new CustomEvent('close'));
        } catch (e) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Save failed',
                    message: e?.body?.message || e?.message || 'Unknown error',
                    variant: 'error'
                })
            );
        } finally {
            this.isSaving = false;
        }
    }
}
