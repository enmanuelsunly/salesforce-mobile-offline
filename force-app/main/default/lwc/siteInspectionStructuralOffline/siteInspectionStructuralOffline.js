import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Site_Inspection__c fields
import ATTIC_NOTES_FIELD from '@salesforce/schema/Site_Inspection__c.Attic_Notes__c';
import ATTIC_1_LOCATION_FIELD from '@salesforce/schema/Site_Inspection__c.Attic_1_Location__c';
import ATTIC_2_LOCATION_FIELD from '@salesforce/schema/Site_Inspection__c.Attic_Location_2__c';
import ATTIC_3_LOCATION_FIELD from '@salesforce/schema/Site_Inspection__c.Attic_Location_3__c';
import ATTIC_4_LOCATION_FIELD from '@salesforce/schema/Site_Inspection__c.Attic_Location_4__c';

const FIELDS = [
    ATTIC_NOTES_FIELD,
    ATTIC_1_LOCATION_FIELD,
    ATTIC_2_LOCATION_FIELD,
    ATTIC_3_LOCATION_FIELD,
    ATTIC_4_LOCATION_FIELD
];

const STORAGE_PREFIX = 'siteInspection_structural_';

export default class SiteInspectionStructuralAction extends LightningElement {
    @api recordId;

    atticNotes;
    atticLocation1;
    atticLocation2;
    atticLocation3;
    atticLocation4;

    get storageKey() {
        return STORAGE_PREFIX + this.recordId;
    }

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data, error }) {
        if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading Structural data',
                    message: error.body?.message || error.message,
                    variant: 'error'
                })
            );
            return;
        }
        if (!data) return;

        let draft = null;
        try {
            const raw = window.localStorage.getItem(this.storageKey);
            draft = raw ? JSON.parse(raw) : null;
        } catch (e) {
            draft = null;
        }

        const fields = data.fields;

        this.atticNotes =
            draft?.atticNotes ??
            fields[ATTIC_NOTES_FIELD.fieldApiName]?.value;

        this.atticLocation1 =
            draft?.atticLocation1 ??
            fields[ATTIC_1_LOCATION_FIELD.fieldApiName]?.value;

        this.atticLocation2 =
            draft?.atticLocation2 ??
            fields[ATTIC_2_LOCATION_FIELD.fieldApiName]?.value;

        this.atticLocation3 =
            draft?.atticLocation3 ??
            fields[ATTIC_3_LOCATION_FIELD.fieldApiName]?.value;

        this.atticLocation4 =
            draft?.atticLocation4 ??
            fields[ATTIC_4_LOCATION_FIELD.fieldApiName]?.value;
    }

    handleFieldChange(event) {
        const fieldKey = event.target.dataset.field;
        const value = event.target.value;

        this[fieldKey] = value;
        this.saveDraft();
    }

    saveDraft() {
        const draft = {
            atticNotes: this.atticNotes,
            atticLocation1: this.atticLocation1,
            atticLocation2: this.atticLocation2,
            atticLocation3: this.atticLocation3,
            atticLocation4: this.atticLocation4
        };

        try {
            window.localStorage.setItem(this.storageKey, JSON.stringify(draft));
        } catch (e) {
            // ignore storage errors
        }
    }

    async handleSave() {
        const fields = {
            Id: this.recordId
        };

        fields[ATTIC_NOTES_FIELD.fieldApiName] = this.atticNotes;
        fields[ATTIC_1_LOCATION_FIELD.fieldApiName] = this.atticLocation1;
        fields[ATTIC_2_LOCATION_FIELD.fieldApiName] = this.atticLocation2;
        fields[ATTIC_3_LOCATION_FIELD.fieldApiName] = this.atticLocation3;
        fields[ATTIC_4_LOCATION_FIELD.fieldApiName] = this.atticLocation4;

        const recordInput = { fields };

        try {
            await updateRecord(recordInput);
            window.localStorage.removeItem(this.storageKey);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Structural saved',
                    message:
                        'Changes are saved. If you were offline, they will sync when the device reconnects.',
                    variant: 'success'
                })
            );
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error saving Structural',
                    message: error.body?.message || error.message,
                    variant: 'error'
                })
            );
        }
    }
}
