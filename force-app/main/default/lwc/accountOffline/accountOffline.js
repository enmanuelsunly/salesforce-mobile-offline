import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

// ✅ Standard fields
import NAME_FIELD from '@salesforce/schema/Account.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import BILLING_STREET from '@salesforce/schema/Account.BillingStreet';
import BILLING_CITY from '@salesforce/schema/Account.BillingCity';
import BILLING_STATE from '@salesforce/schema/Account.BillingState';
import BILLING_POSTAL_CODE from '@salesforce/schema/Account.BillingPostalCode';
import BILLING_COUNTRY from '@salesforce/schema/Account.BillingCountry';
import EMAIL_FIELD from '@salesforce/schema/Account.PersonEmail';

// ✅ Custom fields using your exact API names
import SALE_DATE_FIELD from '@salesforce/schema/Account.Sale_Date__c';
import GDRIVE_FIELD from '@salesforce/schema/Account.Google_Drive_Folder__c';

const FIELDS = [
    NAME_FIELD,
    PHONE_FIELD,
    BILLING_STREET,
    BILLING_CITY,
    BILLING_STATE,
    BILLING_POSTAL_CODE,
    BILLING_COUNTRY,
    EMAIL_FIELD,
    SALE_DATE_FIELD,
    GDRIVE_FIELD
];

export default class AccountOffline extends LightningElement {
    @api recordId;
    account;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ data, error }) {
        if (data) {
            const f = data.fields;

            this.account = {
                name: f.Name.value,
                phone: f.Phone.value,
                email: f.PersonEmail && f.PersonEmail.value,
                billingStreet: f.BillingStreet.value,
                billingCity: f.BillingCity.value,
                billingState: f.BillingState.value,
                billingPostalCode: f.BillingPostalCode.value,
                billingCountry: f.BillingCountry.value,
                saleDate: f.Sale_Date__c && f.Sale_Date__c.value,
                googleDriveFolder:
                    f.Google_Drive_Folder__c && f.Google_Drive_Folder__c.value
            };
        } else if (error) {
            // Optional: handle/log error
            this.account = undefined;
        }
    }
}
