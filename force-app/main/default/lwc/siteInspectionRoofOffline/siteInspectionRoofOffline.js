import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

// Fields
import ROOF_CONDITION_FIELD from '@salesforce/schema/Site_Inspection__c.Roof_Condition__c';
import ROOF_NOTES_FIELD from '@salesforce/schema/Site_Inspection__c.Roof_Notes__c';

const FIELDS = [ROOF_CONDITION_FIELD, ROOF_NOTES_FIELD];

export default class SiteInspectionRoofOffline extends LightningElement {
    @api recordId;

    @track form = {
        Roof_Condition__c: '',
        Roof_Notes__c: ''
    };

    isSaving = false;

    // Static options to match the UI: --None--, Poor, Fair, Good, Other
    roofConditionOptions = [
        { label: '--None--', value: '' },
        { label: 'Poor', value: 'Poor' },
        { label: 'Fair', value: 'Fair' },
        { label: 'Good', value: 'Good' },
        { label: 'Other', value: 'Other' }
    ];

    // Load existing values (offline-friendly)
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data, error }) {
        if (data) {
            const f = data.fields;
            this.form = {
                Roof_Condition__c: f.Roof_Condition__c.value ?? '',
                Roof_Notes__c: f.Roof_Notes__c.value
            };
        } else if (error) {
            // optional: console.error(error);
        }
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.form = { ...this.form, [name]: value };
    }

    async handleSave() {
        this.isSaving = true;
        try {
            const fields = {
                Id: this.recordId,
                Roof_Condition__c: this.form.Roof_Condition__c || null,
                Roof_Notes__c: this.form.Roof_Notes__c
            };

            await updateRecord({ fields });
            this.dispatchEvent(new CustomEvent('close'));
        } catch (e) {
            // optional: console.error(e);
        } finally {
            this.isSaving = false;
        }
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
