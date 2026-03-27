import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

// Schema imports for Site_Inspection__c
import METER_LOCATION from '@salesforce/schema/Site_Inspection__c.Meter_Location__c';
import METER_BASE from '@salesforce/schema/Site_Inspection__c.Meter_Base__c';
import IS_GENERATOR from '@salesforce/schema/Site_Inspection__c.Is_there_a_generator__c';
import GENERATOR_TYPE from '@salesforce/schema/Site_Inspection__c.Generator_Type__c';
import ELECTRICAL_NOTES from '@salesforce/schema/Site_Inspection__c.Electrical_Notes__c';
import SI_ELECTRICAL_FOLDER from '@salesforce/schema/Site_Inspection__c.SI_Electrical_Folder__c';

const FIELDS = [
    METER_LOCATION,
    METER_BASE,
    IS_GENERATOR,
    GENERATOR_TYPE,
    ELECTRICAL_NOTES,
    SI_ELECTRICAL_FOLDER
];

export default class SiteInspectionElectricalOffline extends LightningElement {
    @api recordId;
    @track form = {};
    isSaving = false;
    siElectricalFolder;

    // ----- PICKLIST OPTIONS WITH --None-- -----

    get meterLocationOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Inside', value: 'Inside' },
            { label: 'Outside', value: 'Outside' },
            { label: 'On Pole', value: 'On Pole' }
        ];
    }

    get meterBaseOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Square', value: 'Square' },
            { label: 'Round', value: 'Round' }
        ];
    }

    get generatorTypeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Manual', value: 'Manual' },
            { label: 'Automatic', value: 'Automatic' }
        ];
    }

    // ----- LOAD EXISTING VALUES (OFFLINE-FRIENDLY) -----

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            const f = data.fields;

            this.form = {
                Meter_Location__c: f.Meter_Location__c.value ?? '',
                Meter_Base__c: f.Meter_Base__c.value ?? '',
                Is_there_a_generator__c: f.Is_there_a_generator__c.value,
                Generator_Type__c: f.Generator_Type__c.value ?? '',
                Electrical_Notes__c: f.Electrical_Notes__c.value
            };

            this.siElectricalFolder = f.SI_Electrical_Folder__c.value;
        } else if (error) {
            // Optional: handle error / toast
            // console.error(error);
        }
    }

    // ----- HANDLERS -----

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
                // convert '' (our --None--) back to null so Salesforce treats it as no value
                Meter_Location__c: this.form.Meter_Location__c || null,
                Meter_Base__c: this.form.Meter_Base__c || null,
                Is_there_a_generator__c: this.form.Is_there_a_generator__c,
                Generator_Type__c: this.form.Generator_Type__c || null,
                Electrical_Notes__c: this.form.Electrical_Notes__c
            };

            await updateRecord({ fields });

            this.dispatchEvent(new CustomEvent('close'));
        } catch (e) {
            // Optional: error handling
            // console.error(e);
        } finally {
            this.isSaving = false;
        }
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
