import { LightningElement, api, wire } from 'lwc';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';

import RES_COMM from '@salesforce/schema/Account.Residential_or_Commercial__c';
import NEW_UPDATED from '@salesforce/schema/Account.New_or_Updated__c';
import PROPOSAL_OPTIONS from '@salesforce/schema/Account.Proposal_Options__c';
import TYPE_NEEDED from '@salesforce/schema/Account.Type_of_Proposals_Needed__c';
import GPS from '@salesforce/schema/Account.GPS_Coordinates__c';
import DETAILS from '@salesforce/schema/Account.Proposal_Details__c';

const FIELDS = [RES_COMM, NEW_UPDATED, PROPOSAL_OPTIONS, TYPE_NEEDED, GPS, DETAILS];

export default class AccountRequestProposalOffline extends LightningElement {
    @api recordId;

    draft = {};
    isSaving = false;
    errorMessage = '';

    // Static options (offline-friendly)
    residentialOrCommercialOptions = [
        { label: 'Residential', value: 'Residential' },
        { label: 'Commercial', value: 'Commercial' }
    ];

    newOrUpdatedOptions = [
        { label: 'New', value: 'New' },
        { label: 'Update', value: 'Update' }
    ];

    proposalOptions = [
        { label: 'Sunly', value: 'Sunly' },
        { label: 'Polaron', value: 'Polaron' },
        { label: 'Both', value: 'Both' }
    ];

    typeOfProposalsOptions = [
        { label: 'Roof', value: 'Roof' },
        { label: 'Ground', value: 'Ground' },
        { label: 'Hybrid', value: 'Hybrid' },
        { label: 'Roof and Ground', value: 'Roof and Ground' },
        { label: 'Roof and Ground and Hybrid', value: 'Roof and Ground and Hybrid' }
    ];

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    record;

    // Base values from record
    get residentialOrCommercial() { return this.record.data?.fields?.Residential_or_Commercial__c?.value; }
    get newOrUpdated() { return this.record.data?.fields?.New_or_Updated__c?.value; }
    get proposalOptionsField() { return this.record.data?.fields?.Proposal_Options__c?.value; }
    get typeNeeded() { return this.record.data?.fields?.Type_of_Proposals_Needed__c?.value; }
    get gps() { return this.record.data?.fields?.GPS_Coordinates__c?.value; }
    get details() { return this.record.data?.fields?.Proposal_Details__c?.value; }

    // Display values (draft overrides)
    get residentialOrCommercialValue() { return this.draft.Residential_or_Commercial__c ?? this.residentialOrCommercial ?? ''; }
    get newOrUpdatedValue() { return this.draft.New_or_Updated__c ?? this.newOrUpdated ?? ''; }
    get proposalOptionsValue() { return this.draft.Proposal_Options__c ?? this.proposalOptionsField ?? ''; }
    get typeOfProposalsValue() { return this.draft.Type_of_Proposals_Needed__c ?? this.typeNeeded ?? ''; }
    get gpsCoordinatesValue() { return this.draft.GPS_Coordinates__c ?? this.gps ?? ''; }
    get proposalDetailsValue() { return this.draft.Proposal_Details__c ?? this.details ?? ''; }

    handleChange(event) {
        const { name, value } = event.target;
        this.draft = { ...this.draft, [name]: value };
        this.errorMessage = '';
    }

    handleCancel() {
        // reset unsaved edits
        this.draft = {};
        this.errorMessage = '';
        // wrapper can listen for close if you want, but cancel here just resets.
        this.dispatchEvent(new CustomEvent('close'));
    }

    async handleSave() {
        this.errorMessage = '';

        // Required checks
        const resComm = this.residentialOrCommercialValue;
        const newUpd = this.newOrUpdatedValue;

        if (!resComm || !newUpd) {
            this.errorMessage = 'Please complete the required fields.';
            return;
        }

        this.isSaving = true;
        try {
            const fields = { Id: this.recordId, ...this.draft };
            await updateRecord({ fields });
            this.draft = {};
            this.dispatchEvent(new CustomEvent('close'));
        } catch (e) {
            this.errorMessage = e?.body?.message || e?.message || 'Save failed.';
        } finally {
            this.isSaving = false;
        }
    }
}
