import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import { CloseActionScreenEvent } from 'lightning/actions';

import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

// Standard fields
import NAME_FIELD from '@salesforce/schema/Account.Name';
import SALUTATION_FIELD from '@salesforce/schema/Account.Salutation';
import FIRSTNAME_FIELD from '@salesforce/schema/Account.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Account.LastName';

// Custom fields
import SALES_REP_FIELD from '@salesforce/schema/Account.Sales_Rep__c';
import GOOGLE_DRIVE_FOLDER_FIELD from '@salesforce/schema/Account.Google_Drive_Folder__c';
import FEDERAL_GRANT_INTENT_FIELD from '@salesforce/schema/Account.Federal_Grant_Intent__c';
import ACCOUNT_NUMBER_LDC_FIELD from '@salesforce/schema/Account.Account_Number_On_LDC_Bill__c';
import SALE_TYPE_FIELD from '@salesforce/schema/Account.Sale_Type__c';
import CUSTOMER_TYPE_FIELD from '@salesforce/schema/Account.Customer_Type__c';
import NAME_ON_LDC_BILL_FIELD from '@salesforce/schema/Account.Name_On_LDC_Bill__c';
import PROPERTY_USAGE_FIELD from '@salesforce/schema/Account.Property_Usage__c';
import BUILDING_TYPE_FIELD from '@salesforce/schema/Account.Building_Type__c';
import SUBMISSION_NOTES_FIELD from '@salesforce/schema/Account.Submission_Notes__c';
import SALE_READY_FIELD from '@salesforce/schema/Account.Sale_Ready_for_Validation__c';

// User (lookup target)
import USER_NAME_FIELD from '@salesforce/schema/User.Name';

const ACCOUNT_FIELDS = [
    NAME_FIELD,
    SALUTATION_FIELD,
    FIRSTNAME_FIELD,
    LASTNAME_FIELD,
    SALES_REP_FIELD,
    GOOGLE_DRIVE_FOLDER_FIELD,
    FEDERAL_GRANT_INTENT_FIELD,
    ACCOUNT_NUMBER_LDC_FIELD,
    SALE_TYPE_FIELD,
    CUSTOMER_TYPE_FIELD,
    NAME_ON_LDC_BILL_FIELD,
    PROPERTY_USAGE_FIELD,
    BUILDING_TYPE_FIELD,
    SUBMISSION_NOTES_FIELD,
    SALE_READY_FIELD
];

export default class AccountSubmitSaleOffline extends LightningElement {
    @api recordId;

    draft = {};
    isSaving = false;
    errorMessage = '';

    @wire(getRecord, { recordId: '$recordId', fields: ACCOUNT_FIELDS })
    record;

    // ---------- RecordType for picklists ----------
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo;

    get recordTypeId() {
        return this.objectInfo?.data?.defaultRecordTypeId;
    }

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: SALUTATION_FIELD })
    salutationPicklist;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: FEDERAL_GRANT_INTENT_FIELD })
    federalGrantIntentPicklist;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: SALE_TYPE_FIELD })
    saleTypePicklist;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: CUSTOMER_TYPE_FIELD })
    customerTypePicklist;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: PROPERTY_USAGE_FIELD })
    propertyUsagePicklist;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: BUILDING_TYPE_FIELD })
    buildingTypePicklist;

    @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: SALE_READY_FIELD })
    saleReadyPicklist;

    picklistToOptions(wireResult) {
        const values = wireResult?.data?.values;
        if (!values || !Array.isArray(values)) return [];
        return [{ label: '--None--', value: '' }].concat(values.map(v => ({ label: v.label, value: v.value })));
    }

    // ---------- Picklist options (dyn + fallback) ----------
    get salutationOptionsFinal() {
        const dyn = this.picklistToOptions(this.salutationPicklist);
        return dyn.length ? dyn : [
            { label: '--None--', value: '' },
            { label: 'Mr.', value: 'Mr.' },
            { label: 'Ms.', value: 'Ms.' },
            { label: 'Mrs.', value: 'Mrs.' },
            { label: 'Dr.', value: 'Dr.' },
            { label: 'Prof.', value: 'Prof.' }
        ];
    }

    get federalGrantIntentOptionsFinal() {
        const dyn = this.picklistToOptions(this.federalGrantIntentPicklist);
        return dyn.length ? dyn : [
            { label: '--None--', value: '' },
            { label: 'Solar', value: 'Solar' },
            { label: 'Not applying', value: 'Not applying' },
            { label: 'Greener Homes Loan Only', value: 'Greener Homes Loan Only' }
        ];
    }

    get saleTypeOptionsFinal() {
        const dyn = this.picklistToOptions(this.saleTypePicklist);
        return dyn.length ? dyn : [{ label: '--None--', value: '' }];
    }

    get customerTypeOptionsFinal() {
        const dyn = this.picklistToOptions(this.customerTypePicklist);
        return dyn.length ? dyn : [
            { label: '--None--', value: '' },
            { label: 'Residential', value: 'Residential' },
            { label: 'Commercial', value: 'Commercial' },
            { label: 'Franchise', value: 'Franchise' }
        ];
    }

    get propertyUsageOptionsFinal() {
        const dyn = this.picklistToOptions(this.propertyUsagePicklist);
        return dyn.length ? dyn : [
            { label: '--None--', value: '' },
            { label: 'Full Time Residence', value: 'Full Time Residence' },
            { label: 'Seasonal Property', value: 'Seasonal Property' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get buildingTypeOptionsFinal() {
        const dyn = this.picklistToOptions(this.buildingTypePicklist);
        return dyn.length ? dyn : [
            { label: '--None--', value: '' },
            { label: 'Single Detached', value: 'Single Detached' },
            { label: 'Semi Detached', value: 'Semi Detached' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get saleReadyOptionsFinal() {
        const dyn = this.picklistToOptions(this.saleReadyPicklist);
        return dyn.length ? dyn : [
            { label: '--None--', value: '' },
            { label: 'Sale ready - missing doc', value: 'Sale ready - missing doc' },
            { label: 'Sale ready - complete', value: 'Sale ready - complete' }
        ];
    }

    // ---------- Helpers ----------
    getField(apiName) {
        return this.record?.data?.fields?.[apiName]?.value;
    }

    // ---------- Values (draft overrides) ----------
    get nameValue() { return this.draft.Name ?? this.getField('Name') ?? ''; }
    get salutationValue() { return this.draft.Salutation ?? this.getField('Salutation') ?? ''; }
    get firstNameValue() { return this.draft.FirstName ?? this.getField('FirstName') ?? ''; }
    get lastNameValue() { return this.draft.LastName ?? this.getField('LastName') ?? ''; }

    get googleDriveFolderValue() { return this.draft.Google_Drive_Folder__c ?? this.getField('Google_Drive_Folder__c') ?? ''; }
    get federalGrantIntentValue() { return this.draft.Federal_Grant_Intent__c ?? this.getField('Federal_Grant_Intent__c') ?? ''; }
    get accountNumberLdcValue() { return this.draft.Account_Number_On_LDC_Bill__c ?? this.getField('Account_Number_On_LDC_Bill__c') ?? ''; }
    get saleTypeValue() { return this.draft.Sale_Type__c ?? this.getField('Sale_Type__c') ?? ''; }
    get customerTypeValue() { return this.draft.Customer_Type__c ?? this.getField('Customer_Type__c') ?? ''; }
    get nameOnLdcBillValue() { return this.draft.Name_On_LDC_Bill__c ?? this.getField('Name_On_LDC_Bill__c') ?? ''; }
    get propertyUsageValue() { return this.draft.Property_Usage__c ?? this.getField('Property_Usage__c') ?? ''; }
    get buildingTypeValue() { return this.draft.Building_Type__c ?? this.getField('Building_Type__c') ?? ''; }
    get submissionNotesValue() { return this.draft.Submission_Notes__c ?? this.getField('Submission_Notes__c') ?? ''; }
    get saleReadyValue() { return this.draft.Sale_Ready_for_Validation__c ?? this.getField('Sale_Ready_for_Validation__c') ?? ''; }

    // ---------- Sales Rep (Lookup(User)) ----------
    // Keep storing the Id, but try to display the User.Name
    get salesRepIdValue() {
        return this.draft.Sales_Rep__c ?? this.getField('Sales_Rep__c') ?? null;
    }

    // Try display value from Account wire (works online sometimes)
    get salesRepDisplayFromAccount() {
        return getFieldDisplayValue(this.record?.data, SALES_REP_FIELD) || '';
    }

    // Wire to fetch the User name (works only if User record is accessible/cached)
    @wire(getRecord, { recordId: '$salesRepIdValue', fields: [USER_NAME_FIELD] })
    salesRepUser;

    get salesRepName() {
        const nameFromUser = getFieldValue(this.salesRepUser?.data, USER_NAME_FIELD);
        return nameFromUser || this.salesRepDisplayFromAccount || this.salesRepIdValue || '';
    }

    // ---------- Handlers ----------
    handleChange(event) {
        const { name, value } = event.target;
        this.draft = { ...this.draft, [name]: value };
    }

    handleCancel() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    async handleSave() {
        this.errorMessage = '';
        this.isSaving = true;

        try {
            const fields = { Id: this.recordId, ...this.draft };
            await updateRecord({ fields });
            this.draft = {};
            this.dispatchEvent(new CloseActionScreenEvent());
        } catch (e) {
            this.errorMessage = e?.body?.message || e?.message || 'Unknown error';
        } finally {
            this.isSaving = false;
        }
    }
}
