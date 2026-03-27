import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import { updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';

// Object
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';

// Fields (standard)
import NAME from '@salesforce/schema/Opportunity.Name';
import ACCOUNT_ID from '@salesforce/schema/Opportunity.AccountId';
import CLOSE_DATE from '@salesforce/schema/Opportunity.CloseDate';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';

// Fields (custom + you confirmed / shown in screenshot)
import SALE_TYPE from '@salesforce/schema/Opportunity.Sale_Type__c';
import CUSTOMER_TYPE from '@salesforce/schema/Opportunity.Customer_Type__c';
import FULL_NAME_LDC from '@salesforce/schema/Opportunity.Full_Name_on_LDC_Bill__c';
import ACCOUNT_NUM_LDC from '@salesforce/schema/Opportunity.Account_Number_on_LDC_Bill__c';
import PROPERTY_USAGE from '@salesforce/schema/Opportunity.Property_Usage__c';
import BUILDING_TYPE from '@salesforce/schema/Opportunity.Building_Type__c';
import UTILITY from '@salesforce/schema/Opportunity.Utility__c';

// Related (Account Name)
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';

const FIELDS = [
  NAME,
  ACCOUNT_ID,
  CLOSE_DATE,
  STAGE_NAME,
  SALE_TYPE,
  CUSTOMER_TYPE,
  FULL_NAME_LDC,
  ACCOUNT_NUM_LDC,
  PROPERTY_USAGE,
  BUILDING_TYPE,
  UTILITY
];

export default class OpportunitySubmitSaleOffline extends LightningElement {
  @api recordId;

  draft = {};
  errorMessage = '';
  isSaving = false;

  // Record
  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  opp;

  // Account lookup name fallback
  get accountId() {
    return getFieldValue(this.opp?.data, ACCOUNT_ID);
  }

  @wire(getRecord, { recordId: '$accountId', fields: [ACCOUNT_NAME] })
  accountRec;

  // Object Info / Picklists
  @wire(getObjectInfo, { objectApiName: OPPORTUNITY_OBJECT })
  oppInfo;

  get recordTypeId() {
    return this.oppInfo?.data?.defaultRecordTypeId;
  }

  // Picklist wires
  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: STAGE_NAME })
  stagePick;

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: SALE_TYPE })
  saleTypePick;

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: CUSTOMER_TYPE })
  customerTypePick;

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: PROPERTY_USAGE })
  propertyUsagePick;

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: BUILDING_TYPE })
  buildingTypePick;

  @wire(getPicklistValues, { recordTypeId: '$recordTypeId', fieldApiName: UTILITY })
  utilityPick;

  // Helpers
  get hasData() {
    return !!this.opp?.data;
  }

  pickOptions(wireResult) {
    const vals = wireResult?.data?.values || [];
    return [{ label: '--None--', value: '' }, ...vals.map(v => ({ label: v.label, value: v.value }))];
  }

  // Header values
  get oppName() {
    return getFieldValue(this.opp.data, NAME) || '';
  }

  get accountName() {
    const display = getFieldDisplayValue(this.opp.data, ACCOUNT_ID);
    const fallback = getFieldValue(this.accountRec?.data, ACCOUNT_NAME);
    return display || fallback || this.accountId || '';
  }

  // Current values (draft override)
  get closeDateValue() {
    return this.draft.CloseDate ?? (getFieldValue(this.opp.data, CLOSE_DATE) || '');
  }

  get stageValue() {
    return this.draft.StageName ?? (getFieldValue(this.opp.data, STAGE_NAME) || '');
  }

  get saleTypeValue() {
    return this.draft.Sale_Type__c ?? (getFieldValue(this.opp.data, SALE_TYPE) || '');
  }

  get customerTypeValue() {
    return this.draft.Customer_Type__c ?? (getFieldValue(this.opp.data, CUSTOMER_TYPE) || '');
  }

  get fullNameOnLdcBillValue() {
    return this.draft.Full_Name_on_LDC_Bill__c ?? (getFieldValue(this.opp.data, FULL_NAME_LDC) || '');
  }

  get accountNumberOnLdcBillValue() {
    return this.draft.Account_Number_on_LDC_Bill__c ?? (getFieldValue(this.opp.data, ACCOUNT_NUM_LDC) || '');
  }

  get propertyUsageValue() {
    return this.draft.Property_Usage__c ?? (getFieldValue(this.opp.data, PROPERTY_USAGE) || '');
  }

  get buildingTypeValue() {
    return this.draft.Building_Type__c ?? (getFieldValue(this.opp.data, BUILDING_TYPE) || '');
  }

  get utilityValue() {
    return this.draft.Utility__c ?? (getFieldValue(this.opp.data, UTILITY) || '');
  }

  // Picklist options
  get stageOptions() { return this.pickOptions(this.stagePick); }
  get saleTypeOptions() { return this.pickOptions(this.saleTypePick); }
  get customerTypeOptions() { return this.pickOptions(this.customerTypePick); }
  get propertyUsageOptions() { return this.pickOptions(this.propertyUsagePick); }
  get buildingTypeOptions() { return this.pickOptions(this.buildingTypePick); }
  get utilityOptions() { return this.pickOptions(this.utilityPick); }

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
      this.errorMessage =
        e?.body?.message ||
        e?.message ||
        'Save failed.';
    } finally {
      this.isSaving = false;
    }
  }
}
