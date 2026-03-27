import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import NAME_FIELD from '@salesforce/schema/Account.Name';
import SALUTATION_FIELD from '@salesforce/schema/Account.Salutation';
import FIRSTNAME_FIELD from '@salesforce/schema/Account.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Account.LastName';

const FIELDS = [NAME_FIELD, SALUTATION_FIELD, FIRSTNAME_FIELD, LASTNAME_FIELD];

export default class AccountIdentityOffline extends LightningElement {
    @api recordId;

    draft = {};
    isSaving = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    // current values from LDS (works online + cached/offline when available in mobile briefcase)
    get name() { return this.record.data?.fields?.Name?.value; }
    get salutation() { return this.record.data?.fields?.Salutation?.value; }
    get firstName() { return this.record.data?.fields?.FirstName?.value; }
    get lastName() { return this.record.data?.fields?.LastName?.value; }

    // display value = draft override if user typed something
    get nameValue() { return this.draft.Name ?? this.name ?? ''; }
    get salutationValue() { return this.draft.Salutation ?? this.salutation ?? ''; }
    get firstNameValue() { return this.draft.FirstName ?? this.firstName ?? ''; }
    get lastNameValue() { return this.draft.LastName ?? this.lastName ?? ''; }

    handleChange(event) {
        const { name, value } = event.target;
        this.draft = { ...this.draft, [name]: value };
    }

    async handleSave() {
        this.isSaving = true;
        try {
            const fields = { Id: this.recordId, ...this.draft };
            await updateRecord({ fields });

            this.draft = {};
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Saved',
                    message: 'Account updated.',
                    variant: 'success'
                })
            );
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
