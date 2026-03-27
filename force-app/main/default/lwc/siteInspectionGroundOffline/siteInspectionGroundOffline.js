import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

// Schema imports
import MAIN_PANEL_METER_ARRAY_DIST
    from '@salesforce/schema/Site_Inspection__c.Main_Panel_Meter_to_Array_Distance_Tot__c';
import TRENCHING_DISTANCE_TOTAL
    from '@salesforce/schema/Site_Inspection__c.Trenching_Distance_Total__c';
import GROUND_NOTES
    from '@salesforce/schema/Site_Inspection__c.Ground_Notes__c';

const FIELDS = [
    MAIN_PANEL_METER_ARRAY_DIST,
    TRENCHING_DISTANCE_TOTAL,
    GROUND_NOTES
];

export default class SiteInspectionGroundOffline extends LightningElement {
    @api recordId;
    @track form = {};
    isSaving = false;

    // Load existing values (offline-friendly)
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data, error }) {
        if (data) {
            const f = data.fields;
            this.form = {
                Main_Panel_Meter_to_Array_Distance_Tot__c:
                    f.Main_Panel_Meter_to_Array_Distance_Tot__c.value ?? '',
                Trenching_Distance_Total__c:
                    f.Trenching_Distance_Total__c.value ?? '',
                Ground_Notes__c: f.Ground_Notes__c.value
            };
        } else if (error) {
            // optional: console.error(error);
        }
    }

    handleChange(event) {
        const { name, type, value, checked } = event.target;
        const val = type === 'checkbox' ? checked : value;

        this.form = {
            ...this.form,
            [name]: val
        };
    }

    async handleSave() {
        this.isSaving = true;
        try {
            const fields = {
                Id: this.recordId,
                Main_Panel_Meter_to_Array_Distance_Tot__c:
                    this.form.Main_Panel_Meter_to_Array_Distance_Tot__c || null,
                Trenching_Distance_Total__c:
                    this.form.Trenching_Distance_Total__c || null,
                Ground_Notes__c: this.form.Ground_Notes__c
            };

            await updateRecord({ fields });

            // Close quick action/modal if wrapped
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
