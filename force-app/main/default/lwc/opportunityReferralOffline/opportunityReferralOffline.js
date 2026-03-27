import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';

// Standard fields
import NAME from '@salesforce/schema/Opportunity.Name';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';
import CLOSE_DATE from '@salesforce/schema/Opportunity.CloseDate';

// Custom fields you gave
import REFERRED_BY from '@salesforce/schema/Opportunity.Reffered_By__c';
import REFERRAL_TYPE from '@salesforce/schema/Opportunity.Referral_Type__c';

// Related record (Account)
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';

const FIELDS = [NAME, STAGE_NAME, CLOSE_DATE, REFERRED_BY, REFERRAL_TYPE];

export default class OpportunityReferralOffline extends LightningElement {
  @api recordId;

  draft = {};
  errorMessage = '';
  isSaving = false;

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  opp;

  @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
  oppInfo;

  get recordTypeId() {
    return this.oppInfo?.data?.defaultRecordTypeId;
  }

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: STAGE_NAME })
  stagePick;

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: REFERRAL_TYPE })
  referralTypePick;

  // Lookup handling (ID + display + fallback)
  get referredById() {
    return getFieldValue(this.opp?.data, REFERRED_BY);
  }

  @wire(getRecord, { recordId: '$referredById', fields: [ACCOUNT_NAME] })
  referredByRec;

  get hasData() {
    return !!this.opp?.data;
  }

  pickOptions(wireResult) {
    const vals = wireResult?.data?.values || [];
    return [{ label: '--None--', value: '' }, ...vals.map(v => ({ label: v.label, value: v.value }))];
  }

  get stageOptions() { return this.pickOptions(this.stagePick); }
  get referralTypeOptions() { return this.pickOptions(this.referralTypePick); }

  // Values (draft override)
  get oppNameValue() {
    return this.draft.Name ?? (getFieldValue(this.opp.data, NAME) || '');
  }

  get stageValue() {
    return this.draft.StageName ?? (getFieldValue(this.opp.data, STAGE_NAME) || '');
  }

  get closeDateValue() {
    return this.draft.CloseDate ?? (getFieldValue(this.opp.data, CLOSE_DATE) || '');
  }

  get referralTypeValue() {
    return this.draft.Referral_Type__c ?? (getFieldValue(this.opp.data, REFERRAL_TYPE) || '');
  }

  get referredByName() {
    // UI API display value first
    const display = getFieldDisplayValue(this.opp.data, REFERRED_BY);
    // fallback to second getRecord Account.Name
    const fallback = getFieldValue(this.referredByRec?.data, ACCOUNT_NAME);
    return display || fallback || this.referredById || '';
  }

  // Handlers
  handleInputChange(event) {
    const field = event.target.dataset.field;
    this.draft = { ...this.draft, [field]: event.target.value };
  }

  handlePicklistChange(event) {
    const field = event.target.dataset.field;
    this.draft = { ...this.draft, [field]: event.detail.value };
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  async handleSave() {
    this.errorMessage = '';
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
