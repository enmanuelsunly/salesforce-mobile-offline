import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

// Fields on Site_Inspection__c
import INSPECTOR_NOTES_FIELD
    from '@salesforce/schema/Site_Inspection__c.Inspector_Notes__c';
import SI_STRUCTURAL_FOLDER_FIELD
    from '@salesforce/schema/Site_Inspection__c.SI_Structural_Folder__c';

const FIELDS = [INSPECTOR_NOTES_FIELD, SI_STRUCTURAL_FOLDER_FIELD];

export default class SiteInspectionInspectorNotesOffline extends LightningElement {
    @api recordId;

    @track form = {
        Inspector_Notes__c: '',
        SI_Structural_Folder__c: ''
    };

    isSaving = false;

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredRecord({ data, error }) {
        if (data) {
            const f = data.fields;
            this.form = {
                Inspector_Notes__c: f.Inspector_Notes__c.value,
                SI_Structural_Folder__c: f.SI_Structural_Folder__c.value
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
                Inspector_Notes__c: this.form.Inspector_Notes__c
            };

            await updateRecord({ fields });

            // let wrapper/quick action know we're done
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
