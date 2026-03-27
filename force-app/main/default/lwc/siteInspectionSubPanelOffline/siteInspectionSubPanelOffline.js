import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// ---- Schema imports: Sub Panel 1 ----
import SUB_PANEL_1_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Type__c';
import SUB_PANEL_1_BREAKER from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Breaker__c';
import SUB_PANEL_1_BUS_RATING from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Bus_Rating__c';
import SUB_PANEL_1_BRAND from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Brand__c';
import SUB_PANEL_1_EMBEDDED from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Embedded__c';
import SUB_PANEL_1_EMBEDDED_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Embedded_Type__c';
import SUB_PANEL_1_FED_BY_BREAKER_SIZE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Fed_by_Breaker_Size__c';
import SUB_PANEL_1_EMBEDDED_NOTE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Embedded_Note__c';
import SUB_PANEL_1_NOTES from '@salesforce/schema/Site_Inspection__c.Sub_Panel_1_Notes__c';

// ---- Schema imports: Sub Panel 2 ----
import SUB_PANEL_2_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Type__c';
import SUB_PANEL_2_BREAKER from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Breaker__c';
import SUB_PANEL_2_BUS_RATING from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Bus_Rating__c';
import SUB_PANEL_2_BRAND from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Brand__c';
import SUB_PANEL_2_EMBEDDED from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Embedded__c';
import SUB_PANEL_2_EMBEDDED_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Embedded_Type__c';
import SUB_PANEL_2_FED_BY_BREAKER_SIZE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Fed_by_Breaker_Size__c';
import SUB_PANEL_2_EMBEDDED_NOTE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Embedded_Note__c';
import SUB_PANEL_2_NOTES from '@salesforce/schema/Site_Inspection__c.Sub_Panel_2_Notes__c';

// ---- Schema imports: Sub Panel 3 ----
import SUB_PANEL_3_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Type__c';
import SUB_PANEL_3_BREAKER from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Breaker__c';
import SUB_PANEL_3_BUS_RATING from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Bus_Rating__c';
import SUB_PANEL_3_BRAND from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Brand__c';
import SUB_PANEL_3_EMBEDDED from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Embedded__c';
import SUB_PANEL_3_EMBEDDED_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Embedded_Type__c';
import SUB_PANEL_3_FED_BY_BREAKER_SIZE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Fed_by_Breaker_Size__c';
import SUB_PANEL_3_EMBEDDED_NOTE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Embedded_Note__c';
import SUB_PANEL_3_NOTES from '@salesforce/schema/Site_Inspection__c.Sub_Panel_3_Notes__c';

// ---- Schema imports: Sub Panel 4 ----
import SUB_PANEL_4_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Type__c';
import SUB_PANEL_4_BREAKER from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Breaker__c';
import SUB_PANEL_4_BUS_RATING from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Bus_Rating__c';
import SUB_PANEL_4_BRAND from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Brand__c';
import SUB_PANEL_4_EMBEDDED from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Embedded__c';
import SUB_PANEL_4_EMBEDDED_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Embedded_Type__c';
import SUB_PANEL_4_FED_BY_BREAKER_SIZE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Fed_by_Breaker_Size__c';
import SUB_PANEL_4_EMBEDDED_NOTE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Embedded_Note__c';
import SUB_PANEL_4_NOTES from '@salesforce/schema/Site_Inspection__c.Sub_Panel_4_Notes__c';

// ---- Schema imports: Sub Panel 5 ----
import SUB_PANEL_5_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Type__c';
import SUB_PANEL_5_BREAKER from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Breaker__c';
import SUB_PANEL_5_BUS_RATING from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Bus_Rating__c';
import SUB_PANEL_5_BRAND from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Brand__c';
import SUB_PANEL_5_EMBEDDED from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Embedded__c';
import SUB_PANEL_5_EMBEDDED_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Embedded_Type__c';
import SUB_PANEL_5_FED_BY_BREAKER_SIZE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Fed_by_Breaker_Size__c';
import SUB_PANEL_5_EMBEDDED_NOTE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Embedded_Note__c';
import SUB_PANEL_5_NOTES from '@salesforce/schema/Site_Inspection__c.Sub_Panel_5_Notes__c';

// ---- Schema imports: Sub Panel 6 ----
import SUB_PANEL_6_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Type__c';
import SUB_PANEL_6_BREAKER from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Breaker__c';
import SUB_PANEL_6_BUS_RATING from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Bus_Rating__c';
import SUB_PANEL_6_BRAND from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Brand__c';
import SUB_PANEL_6_EMBEDDED from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Embedded__c';
import SUB_PANEL_6_EMBEDDED_TYPE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Embedded_Type__c';
import SUB_PANEL_6_FED_BY_BREAKER_SIZE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Fed_by_Breaker_Size__c';
import SUB_PANEL_6_EMBEDDED_NOTE from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Embedded_Note__c';
import SUB_PANEL_6_NOTES from '@salesforce/schema/Site_Inspection__c.Sub_Panel_6_Notes__c';

// Map panel number -> fields for that panel
const PANEL_FIELDS = {
    '1': {
        type: SUB_PANEL_1_TYPE,
        breaker: SUB_PANEL_1_BREAKER,
        busRating: SUB_PANEL_1_BUS_RATING,
        brand: SUB_PANEL_1_BRAND,
        embedded: SUB_PANEL_1_EMBEDDED,
        embeddedType: SUB_PANEL_1_EMBEDDED_TYPE,
        fedByBreakerSize: SUB_PANEL_1_FED_BY_BREAKER_SIZE,
        embeddedNote: SUB_PANEL_1_EMBEDDED_NOTE,
        notes: SUB_PANEL_1_NOTES
    },
    '2': {
        type: SUB_PANEL_2_TYPE,
        breaker: SUB_PANEL_2_BREAKER,
        busRating: SUB_PANEL_2_BUS_RATING,
        brand: SUB_PANEL_2_BRAND,
        embedded: SUB_PANEL_2_EMBEDDED,
        embeddedType: SUB_PANEL_2_EMBEDDED_TYPE,
        fedByBreakerSize: SUB_PANEL_2_FED_BY_BREAKER_SIZE,
        embeddedNote: SUB_PANEL_2_EMBEDDED_NOTE,
        notes: SUB_PANEL_2_NOTES
    },
    '3': {
        type: SUB_PANEL_3_TYPE,
        breaker: SUB_PANEL_3_BREAKER,
        busRating: SUB_PANEL_3_BUS_RATING,
        brand: SUB_PANEL_3_BRAND,
        embedded: SUB_PANEL_3_EMBEDDED,
        embeddedType: SUB_PANEL_3_EMBEDDED_TYPE,
        fedByBreakerSize: SUB_PANEL_3_FED_BY_BREAKER_SIZE,
        embeddedNote: SUB_PANEL_3_EMBEDDED_NOTE,
        notes: SUB_PANEL_3_NOTES
    },
    '4': {
        type: SUB_PANEL_4_TYPE,
        breaker: SUB_PANEL_4_BREAKER,
        busRating: SUB_PANEL_4_BUS_RATING,
        brand: SUB_PANEL_4_BRAND,
        embedded: SUB_PANEL_4_EMBEDDED,
        embeddedType: SUB_PANEL_4_EMBEDDED_TYPE,
        fedByBreakerSize: SUB_PANEL_4_FED_BY_BREAKER_SIZE,
        embeddedNote: SUB_PANEL_4_EMBEDDED_NOTE,
        notes: SUB_PANEL_4_NOTES
    },
    '5': {
        type: SUB_PANEL_5_TYPE,
        breaker: SUB_PANEL_5_BREAKER,
        busRating: SUB_PANEL_5_BUS_RATING,
        brand: SUB_PANEL_5_BRAND,
        embedded: SUB_PANEL_5_EMBEDDED,
        embeddedType: SUB_PANEL_5_EMBEDDED_TYPE,
        fedByBreakerSize: SUB_PANEL_5_FED_BY_BREAKER_SIZE,
        embeddedNote: SUB_PANEL_5_EMBEDDED_NOTE,
        notes: SUB_PANEL_5_NOTES
    },
    '6': {
        type: SUB_PANEL_6_TYPE,
        breaker: SUB_PANEL_6_BREAKER,
        busRating: SUB_PANEL_6_BUS_RATING,
        brand: SUB_PANEL_6_BRAND,
        embedded: SUB_PANEL_6_EMBEDDED,
        embeddedType: SUB_PANEL_6_EMBEDDED_TYPE,
        fedByBreakerSize: SUB_PANEL_6_FED_BY_BREAKER_SIZE,
        embeddedNote: SUB_PANEL_6_EMBEDDED_NOTE,
        notes: SUB_PANEL_6_NOTES
    }
};

// Flatten all fields for the wire (we load them all once)
const FIELDS = Object.values(PANEL_FIELDS).reduce((all, cfg) => {
    Object.values(cfg).forEach(field => all.push(field));
    return all;
}, []);

export default class SiteInspectionSubPanelOffline extends LightningElement {
    @api recordId;
    @api panelNumber = '1';

    @track error;

    // UI values
    @track typeValue;
    @track breakerValue;
    @track busRatingValue;
    @track brandValue;
    @track embeddedChecked = false;
    @track embeddedTypeValue;
    @track fedByBreakerSizeValue;
    @track embeddedNoteValue;
    @track notesValue;

    get currentFields() {
        return PANEL_FIELDS[this.panelNumber] || PANEL_FIELDS['1'];
    }

    // Labels
    get panelTitle() {
        return `Sub Panel ${this.panelNumber}`;
    }
    get typeLabel() {
        return `Sub Panel ${this.panelNumber} Type`;
    }
    get breakerLabel() {
        return `Sub Panel ${this.panelNumber} Breaker`;
    }
    get busRatingLabel() {
        return `Sub Panel ${this.panelNumber} Bus Rating`;
    }
    get brandLabel() {
        return `Sub Panel ${this.panelNumber} Brand`;
    }
    get embeddedLabel() {
        return `Sub Panel ${this.panelNumber} Embedded`;
    }
    get embeddedTypeLabel() {
        return `Sub Panel ${this.panelNumber} Embedded Type`;
    }
    get fedByBreakerSizeLabel() {
        return `Sub Panel ${this.panelNumber} Fed by Breaker Size`;
    }
    get embeddedNoteLabel() {
        return `Sub Panel ${this.panelNumber} Embedded Note`;
    }
    get notesLabel() {
        return `Sub Panel ${this.panelNumber} Notes`;
    }

    // Options (same for all panels)
    get typeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Fuse', value: 'Fuse' },
            { label: 'Breaker', value: 'Breaker' }
        ];
    }

    get breakerOptions() {
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

    get busRatingOptions() {
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

    get brandOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Square D', value: 'Square D' },
            { label: 'Siemens', value: 'Siemens' },
            { label: 'Schneider', value: 'Schneider' },
            { label: 'Eaton', value: 'Eaton' },
            { label: 'Cutler Hammer', value: 'Cutler Hammer' },
            { label: 'Stablok', value: 'Stablok' },
            { label: 'Leviton', value: 'Leviton' },
            { label: 'Other', value: 'Other' }
        ];
    }

    get embeddedTypeOptions() {
        return [
            { label: '--None--', value: '' },
            { label: 'Drywall', value: 'Drywall' },
            { label: 'Wood', value: 'Wood' },
            { label: 'Other', value: 'Other' }
        ];
    }

    // Load data
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.error = undefined;
            const f = this.currentFields;

            this.typeValue = getFieldValue(data, f.type);
            this.breakerValue = getFieldValue(data, f.breaker);
            this.busRatingValue = getFieldValue(data, f.busRating);
            this.brandValue = getFieldValue(data, f.brand);
            this.embeddedChecked = !!getFieldValue(data, f.embedded);
            this.embeddedTypeValue = getFieldValue(data, f.embeddedType);
            this.fedByBreakerSizeValue = getFieldValue(data, f.fedByBreakerSize);
            this.embeddedNoteValue = getFieldValue(data, f.embeddedNote);
            this.notesValue = getFieldValue(data, f.notes);
        } else if (error) {
            this.error = error;
        }
    }

    // Change handlers
    handleTypeChange(event) {
        this.typeValue = event.detail.value;
    }
    handleBreakerChange(event) {
        this.breakerValue = event.detail.value;
    }
    handleBusRatingChange(event) {
        this.busRatingValue = event.detail.value;
    }
    handleBrandChange(event) {
        this.brandValue = event.detail.value;
    }
    handleEmbeddedChange(event) {
        this.embeddedChecked = event.target.checked;
    }
    handleEmbeddedTypeChange(event) {
        this.embeddedTypeValue = event.detail.value;
    }
    handleFedByBreakerSizeChange(event) {
        this.fedByBreakerSizeValue = event.target.value;
    }
    handleEmbeddedNoteChange(event) {
        this.embeddedNoteValue = event.target.value;
    }
    handleNotesChange(event) {
        this.notesValue = event.target.value;
    }

    handleCancel() {
        // Let the wrapper close the screen
        this.dispatchEvent(new CustomEvent('close'));
    }

    async handleSave() {
        this.error = undefined;
        try {
            const f = this.currentFields;
            const fields = {
                Id: this.recordId
            };

            fields[f.type.fieldApiName] = this.typeValue || null;
            fields[f.breaker.fieldApiName] = this.breakerValue || null;
            fields[f.busRating.fieldApiName] = this.busRatingValue || null;
            fields[f.brand.fieldApiName] = this.brandValue || null;
            fields[f.embedded.fieldApiName] = this.embeddedChecked;
            fields[f.embeddedType.fieldApiName] = this.embeddedTypeValue || null;
            fields[f.fedByBreakerSize.fieldApiName] = this.fedByBreakerSizeValue || null;
            fields[f.embeddedNote.fieldApiName] = this.embeddedNoteValue || null;
            fields[f.notes.fieldApiName] = this.notesValue || null;

            await updateRecord({ fields });

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Saved',
                    message: `Sub Panel ${this.panelNumber} updated`,
                    variant: 'success'
                })
            );

            this.dispatchEvent(new CustomEvent('close'));
        } catch (e) {
            this.error = e;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error saving Sub Panel',
                    variant: 'error'
                })
            );
        }
    }
}
