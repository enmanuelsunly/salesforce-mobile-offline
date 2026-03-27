import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

// Schema imports for Site_Inspection__c
import MAIN_PANEL_TYPE from '@salesforce/schema/Site_Inspection__c.Main_Panel_Type__c';
import MAIN_PANEL_BREAKER from '@salesforce/schema/Site_Inspection__c.Main_Panel_Breaker__c';
import MAIN_BUS_RATING from '@salesforce/schema/Site_Inspection__c.Main_Bus_Rating__c';
import MAIN_PANEL_BRAND from '@salesforce/schema/Site_Inspection__c.Main_Panel_Brand__c';
import PANEL_EMBEDDED from '@salesforce/schema/Site_Inspection__c.Panel_Embedded__c';
import EMBEDDED_TYPE from '@salesforce/schema/Site_Inspection__c.Embedded_Type__c';
import EMBEDDED_NOTE from '@salesforce/schema/Site_Inspection__c.Embedded_note__c';
import MAIN_PANEL_NOTES from '@salesforce/schema/Site_Inspection__c.Main_Panel_Notes__c';

const FIELDS = [
    MAIN_PANEL_TYPE,
    MAIN_PANEL_BREAKER,
    MAIN_BUS_RATING,
    MAIN_PANEL_BRAND,
    PANEL_EMBEDDED,
    EMBEDDED_TYPE,
    EMBEDDED_NOTE,
    MAIN_PANEL_NOTES
];

export default class SiteInspectionMainPanelOffline extends LightningElement {
    @api recordId;
    @track form = {};
    isSaving = false;

    // ----- PICKLIST OPTIONS WITH --None-- -----

    // Main Panel Type: Fuse / Breaker
    get mainPanelTypeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Fuse', value: 'Fuse' },
            { label: 'Breaker', value: 'Breaker' }
        ];
    }

    // Main Panel Breaker: 100A, 125A, 200A, 225A, 400A, Other
    get mainPanelBreakerOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '100A', value: '100A' },
            { label: '125A', value: '125A' },
            { label: '200A', value: '200A' },
            { label: '225A', value: '225A' },
            { label: '400A', value: '400A' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // Main Bus Rating: 100A, 125A, 200A, 225A, 400A, No label/Unknown, Other
    get mainBusRatingOptions() {
        return [
            { label: '--None--', value: '' },
            { label: '100A', value: '100A' },
            { label: '125A', value: '125A' },
            { label: '200A', value: '200A' },
            { label: '225A', value: '225A' },
            { label: '400A', value: '400A' },
            { label: 'No label/Unknown', value: 'No label/Unknown' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // Main Panel Brand: Square D, Siemens, Schneider, Eaton, Cutler Hammer, Stablok, Leviton, Other
    get mainPanelBrandOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Square D', value: 'Square D' },
            { label: 'Siemens', value: 'Siemens' },
            { label: 'Schneider', value: 'Schneider' },   // make sure this matches your picklist value EXACTLY
            { label: 'Eaton', value: 'Eaton' },
            { label: 'Cutler Hammer', value: 'Cutler Hammer' },
            { label: 'Stablok', value: 'Stablok' },
            { label: 'Leviton', value: 'Leviton' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // Embedded Type: Drywall, Wood, Other
    get embeddedTypeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Drywall', value: 'Drywall' },
            { label: 'Wood', value: 'Wood' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // ----- LOAD EXISTING VALUES (OFFLINE-FRIENDLY) -----

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            const f = data.fields;

            this.form = {
                Main_Panel_Type__c: f.Main_Panel_Type__c.value ?? '',
                Main_Panel_Breaker__c: f.Main_Panel_Breaker__c.value ?? '',
                Main_Bus_Rating__c: f.Main_Bus_Rating__c.value ?? '',
                Main_Panel_Brand__c: f.Main_Panel_Brand__c.value ?? '',
                Panel_Embedded__c: f.Panel_Embedded__c.value,
                Embedded_Type__c: f.Embedded_Type__c.value ?? '',
                Embedded_note__c: f.Embedded_note__c.value,
                Main_Panel_Notes__c: f.Main_Panel_Notes__c.value
            };
        } else if (error) {
            // Optional: toast / console
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
                // convert '' (our --None--) to null so Salesforce treats it as no value
                Main_Panel_Type__c: this.form.Main_Panel_Type__c || null,
                Main_Panel_Breaker__c: this.form.Main_Panel_Breaker__c || null,
                Main_Bus_Rating__c: this.form.Main_Bus_Rating__c || null,
                Main_Panel_Brand__c: this.form.Main_Panel_Brand__c || null,
                Panel_Embedded__c: this.form.Panel_Embedded__c,
                Embedded_Type__c: this.form.Embedded_Type__c || null,
                Embedded_note__c: this.form.Embedded_note__c,
                Main_Panel_Notes__c: this.form.Main_Panel_Notes__c
            };

            await updateRecord({ fields });

            // Close the quick action/modal if wrapped
            this.dispatchEvent(new CustomEvent('close'));
        } catch (e) {
            // Optional: show error
            // console.error(e);
        } finally {
            this.isSaving = false;
        }
    }

    handleCancel() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}
