import { LightningElement, api, wire } from 'lwc';
import { getRecord, createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';

import ACCOUNT_NAME_FIELD from '@salesforce/schema/Account.Name';
import STAGE_FIELD from '@salesforce/schema/Opportunity.StageName';

const ACCOUNT_FIELDS = [ACCOUNT_NAME_FIELD];

export default class AccountNewOpportunityOffline extends LightningElement {
    @api recordId; // Account Id

    draft = {};
    isSaving = false;
    errorMessage = '';

    // Read Account Name for display
    @wire(getRecord, { recordId: '$recordId', fields: ACCOUNT_FIELDS })
    accountRecord;

    get accountName() {
        return this.accountRecord?.data?.fields?.Name?.value || '';
    }

    // Object info for Opportunity picklists
    @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
    oppObjectInfo;

    get oppRecordTypeId() {
        return this.oppObjectInfo?.data?.defaultRecordTypeId;
    }

    // Stage picklist (no hardcoding)
    @wire(getPicklistValues, { recordTypeId: '$oppRecordTypeId', fieldApiName: STAGE_FIELD })
    stagePicklist;

    get stageOptions() {
        const values = this.stagePicklist?.data?.values;
        if (!values || !Array.isArray(values)) {
            // still "not hardcoded": we only show None if metadata isn't available
            return [{ label: '--None--', value: '' }];
        }
        return [{ label: '--None--', value: '' }].concat(
            values.map(v => ({ label: v.label, value: v.value }))
        );
    }

    // Display values (draft overrides)
    get oppNameValue() { return this.draft.Name ?? ''; }
    get closeDateValue() { return this.draft.CloseDate ?? ''; }
    get stageValue() { return this.draft.StageName ?? ''; }
    get amountValue() { return this.draft.Amount ?? ''; }
    get nextStepValue() { return this.draft.NextStep ?? ''; }

    handleChange(event) {
        const { name, value } = event.target;
        this.draft = { ...this.draft, [name]: value };
        this.errorMessage = '';
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    async handleSave() {
        this.isSaving = true;
        this.errorMessage = '';

        try {
            // Required fields
            const missingRequired = !this.oppNameValue || !this.closeDateValue || !this.stageValue;
            if (missingRequired) {
                this.errorMessage = 'Please complete all required fields.';
                this.isSaving = false;
                return;
            }

            const fields = {
                AccountId: this.recordId,
                Name: this.oppNameValue,
                CloseDate: this.closeDateValue,
                StageName: this.stageValue
            };

            // Optional fields
            if (this.amountValue !== '' && this.amountValue !== null && this.amountValue !== undefined) {
                fields.Amount = Number(this.amountValue);
            }
            if (this.nextStepValue) {
                fields.NextStep = this.nextStepValue;
            }

            await createRecord({
                apiName: 'Opportunity',
                fields
            });

            this.draft = {};
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Saved',
                    message: 'Opportunity created.',
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
