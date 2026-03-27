import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import NAME from '@salesforce/schema/Account.Name';
import PHONE from '@salesforce/schema/Account.Phone';
import BILLING_STREET from '@salesforce/schema/Account.BillingStreet';
import BILLING_CITY from '@salesforce/schema/Account.BillingCity';
import BILLING_STATE from '@salesforce/schema/Account.BillingState';
import BILLING_POSTAL from '@salesforce/schema/Account.BillingPostalCode';
import BILLING_COUNTRY from '@salesforce/schema/Account.BillingCountry';

const FIELDS = [
    NAME,
    PHONE,
    BILLING_STREET,
    BILLING_CITY,
    BILLING_STATE,
    BILLING_POSTAL,
    BILLING_COUNTRY
];

export default class ViewAccountOffline extends LightningElement {
    @api recordId;

    selected = 'details'; // 'proposal' | 'identity' | 'details'
    errorMessage;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ data, error }) {
        if (data) {
            this.errorMessage = null;
        } else if (error) {
            this.errorMessage = error?.body?.message || error?.message || 'Error loading Account.';
        }
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    account;

    get hasData() {
        return this.account?.data;
    }

    get accountName() {
        return getFieldValue(this.account.data, NAME);
    }

    get phone() {
        return getFieldValue(this.account.data, PHONE);
    }

    get phoneHref() {
        return this.phone ? `tel:${this.phone}` : '';
    }

    get billingLine() {
        const street = getFieldValue(this.account.data, BILLING_STREET);
        const city = getFieldValue(this.account.data, BILLING_CITY);
        const state = getFieldValue(this.account.data, BILLING_STATE);
        const postal = getFieldValue(this.account.data, BILLING_POSTAL);
        const country = getFieldValue(this.account.data, BILLING_COUNTRY);

        const parts = [street, city, state, postal, country].filter(Boolean);
        return parts.length ? parts.join(', ') : '';
    }

    // section flags
    get isIdentity() { return this.selected === 'identity'; }
    get isDetails() { return this.selected === 'details'; }

    // button classes (simple “active” state)
    get identityBtnClass() { return this.selected === 'identity' ? 'tile active' : 'tile'; }
    get detailsBtnClass() { return this.selected === 'details' ? 'tile active' : 'tile'; }

    openIdentity() { this.selected = 'identity'; }
    openDetails() { this.selected = 'details'; }
}
