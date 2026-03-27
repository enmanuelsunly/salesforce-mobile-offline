import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord ,getFieldValue, getFieldDisplayValue} from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import ACCOUNT_NAME from '@salesforce/schema/Account.Name';

// Standard fields
import NAME_FIELD from '@salesforce/schema/Account.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';

// Custom fields
import PRIMARY_EMAIL from '@salesforce/schema/Account.Primary_Email__c';
import REFERRED_BY from '@salesforce/schema/Account.Referred_By__c';

import REFERRAL_TYPE from '@salesforce/schema/Account.Enhanced_Referral__c';
import SALE_STAGES from '@salesforce/schema/Account.Sale_Stages__c';
import SALES_COMPANY from '@salesforce/schema/Account.Sales_Company__c';
import ACCOUNT_STAGE from '@salesforce/schema/Account.Account_Stage__c';
import ACCOUNT_STATUS from '@salesforce/schema/Account.Account_Status__c';

const FIELDS = [
    NAME_FIELD,
    PHONE_FIELD,
    PRIMARY_EMAIL,
    REFERRED_BY,
    REFERRAL_TYPE,
    SALE_STAGES,
    SALES_COMPANY,
    ACCOUNT_STAGE,
    ACCOUNT_STATUS
];

export default class AccountReferralOffline extends LightningElement {
    @api recordId;

    draft = {};
    isSaving = false;
    errorMessage = '';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    @wire(getRecord, { recordId: '$referredById', fields: [ACCOUNT_NAME] })
    referredAccount;


    // ---- Options (hardcoded so it works offline) ----
    get referralTypeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'General Referral', value: 'General Referral' },
            { label: 'Enhanced Referral', value: 'Enhanced Referral' }
        ];
    }

    get referredById() {
        return getFieldValue(this.record.data, REFERRED_BY);
    }

    get referredByName() {
        // Prefer actual Account.Name if we can fetch it (best for offline too)
        const n = getFieldValue(this.referredAccount?.data, ACCOUNT_NAME);
        return n || getFieldDisplayValue(this.record.data, REFERRED_BY) || this.referredById || '';
    }


    get salesCompanyOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Sunly Energy Corp.', value: 'Sunly Energy Corp.' },
            { label: 'Polaron', value: 'Polaron' },
            { label: 'Solar-X', value: 'Solar-X' },
            { label: 'mySolar', value: 'mySolar' }
        ];
    }

    get accountStageOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Lead', value: 'Lead' },
            { label: 'Pre-Sale', value: 'Pre-Sale' },
            { label: 'Post-Sale', value: 'Post-Sale' },
            { label: 'Installation', value: 'Installation' },
            { label: 'Client Care', value: 'Client Care' }
        ];
    }

    get accountStatusOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Open', value: 'Open' },
            { label: 'Won', value: 'Won' },
            { label: 'Lost', value: 'Lost' },
            { label: 'Cancelled', value: 'Cancelled' }
        ];
    }

    // This list can be extended later if your org has more values
    get saleStagesOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Lead In', value: 'Lead In' },
            { label: '1st Attempt Completed', value: '1st Attempt Completed' },
            { label: '2nd Attempt Completed', value: '2nd Attempt Completed' },
            { label: '3rd Attempt Completed', value: '3rd Attempt Completed' },
            { label: '4th Attempt Completed', value: '4th Attempt Completed' },
            { label: 'Contact Made', value: 'Contact Made' }
        ];
    }

    // ---- helpers to read current record values ----
    get f() {
        return this.record?.data?.fields || {};
    }

    get name() { return this.f.Name?.value; }
    get phone() { return this.f.Phone?.value; }
    get primaryEmail() { return this.f.Primary_Email__c?.value; }
    get referredBy() { return this.f.Referred_By__c?.value; }

    get referralType() { return this.f.Enhanced_Referral__c?.value; }
    get saleStages() { return this.f.Sale_Stages__c?.value; }
    get salesCompany() { return this.f.Sales_Company__c?.value; }
    get accountStage() { return this.f.Account_Stage__c?.value; }
    get accountStatus() { return this.f.Account_Status__c?.value; }

    // ---- displayed values = draft override ----
    get nameValue() { return this.draft.Name ?? this.name ?? ''; }
    get phoneValue() { return this.draft.Phone ?? this.phone ?? ''; }
    get primaryEmailValue() { return this.draft.Primary_Email__c ?? this.primaryEmail ?? ''; }
    get referredByValue() { return this.draft.Referred_By__c ?? this.referredBy ?? ''; }

    get referralTypeValue() { return this.draft.Enhanced_Referral__c ?? this.referralType ?? ''; }
    get saleStagesValue() { return this.draft.Sale_Stages__c ?? this.saleStages ?? ''; }
    get salesCompanyValue() { return this.draft.Sales_Company__c ?? this.salesCompany ?? ''; }
    get accountStageValue() { return this.draft.Account_Stage__c ?? this.accountStage ?? ''; }
    get accountStatusValue() { return this.draft.Account_Status__c ?? this.accountStatus ?? ''; }

    handleChange(event) {
        const { name, value } = event.target;
        this.draft = { ...this.draft, [name]: value };
        this.errorMessage = '';
    }

    handleCancel() {
        // lets the wrapper close the quick action
        this.dispatchEvent(new CustomEvent('close'));
    }

    async handleSave() {
        this.isSaving = true;
        this.errorMessage = '';

        try {
            // Minimal required validation (matches your UI)
            const requiredMissing =
                !this.nameValue ||
                !this.salesCompanyValue ||
                !this.accountStageValue ||
                !this.accountStatusValue;

            if (requiredMissing) {
                this.errorMessage = 'Please complete all required fields.';
                this.isSaving = false;
                return;
            }

            const fields = { Id: this.recordId, ...this.draft };
            await updateRecord({ fields });

            this.draft = {};
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Saved',
                    message: 'Referral info updated.',
                    variant: 'success'
                })
            );

            // optional: auto-close after save
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
