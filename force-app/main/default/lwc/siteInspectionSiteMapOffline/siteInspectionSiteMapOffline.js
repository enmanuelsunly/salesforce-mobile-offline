import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

import SITE_MAP_NOTES_FIELD
    from '@salesforce/schema/Site_Inspection__c.Site_Map_Notes__c';
import SITE_INSPECTION_FOLDER_FIELD
    from '@salesforce/schema/Site_Inspection__c.Site_Inspection_Folder__c';

const FIELDS = [SITE_MAP_NOTES_FIELD, SITE_INSPECTION_FOLDER_FIELD];

export default class SiteInspectionSiteMapOffline extends LightningElement {
    @api recordId;

    @track form = {
        Site_Map_Notes__c: '',
        Site_Inspection_Folder__c: ''
    };

    isSaving = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data, error }) {
        if (data) {
            const f = data.fields;
            this.form = {
                Site_Map_Notes__c: f.Site_Map_Notes__c.value,
                Site_Inspection_Folder__c: f.Site_Inspection_Folder__c.value
            };
        } else if (error) {
            // optional: console.error(error);
        }
    }

    handleChange(event) {
        const { name, value } = event.target;
        this.form = {
            ...this.form,
            [name]: value
        };
    }

    async handleSave() {
        this.isSaving = true;

        try {
            const fields = {
                Id: this.recordId,
                Site_Map_Notes__c: this.form.Site_Map_Notes__c
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
