import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';

import NAME from '@salesforce/schema/Account.Name';
import PHONE from '@salesforce/schema/Account.Phone';
import BILLING_STREET from '@salesforce/schema/Account.BillingStreet';
import BILLING_CITY from '@salesforce/schema/Account.BillingCity';
import BILLING_STATE from '@salesforce/schema/Account.BillingState';
import BILLING_POSTAL from '@salesforce/schema/Account.BillingPostalCode';
import BILLING_COUNTRY from '@salesforce/schema/Account.BillingCountry';

import SOLAR_PROGRAM_TYPE from '@salesforce/schema/Account.Solar_Program_Type__c';
import PRIMARY_EMAIL from '@salesforce/schema/Account.Primary_Email__c';
import PROVINCE from '@salesforce/schema/Account.Province__c';
import ACCOUNT_STATUS from '@salesforce/schema/Account.Account_Status__c';
import ACCOUNT_STAGE from '@salesforce/schema/Account.Account_Stage__c';
import TERRITORY from '@salesforce/schema/Account.Territory__c';
import HOW_HEAR from '@salesforce/schema/Account.How_did_you_hear_about_us__c';
import AVG_UTILITY_BILL from '@salesforce/schema/Account.Avg_Utility_Bill__c';
import ROOF from '@salesforce/schema/Account.Roof__c';
import EXPECTED_LOAD_INCREASES from '@salesforce/schema/Account.Expected_Load_Increases__c';
import PROJECT_TYPE from '@salesforce/schema/Account.Project_Type__c';

import REFERRED_BY from '@salesforce/schema/Account.Referred_By__c';
import REFERRAL_TYPE from '@salesforce/schema/Account.Enhanced_Referral__c';

import ROOF_AGE from '@salesforce/schema/Account.Roof_age_text__c';
import PROPERTY_ID from '@salesforce/schema/Account.Property_ID__c';

import HOME_OWNER_1 from '@salesforce/schema/Account.Home_owner_1__c';
import HOME_OWNER_2 from '@salesforce/schema/Account.Home_owner_2__c';
import HOME_OWNER_3 from '@salesforce/schema/Account.Home_Owner_3__c';
import HOME_OWNER_1_FULLNAME from '@salesforce/schema/Account.Home_Owner_1_Full_Name__c';

import PROPOSAL from '@salesforce/schema/Account.Proposal__c';
import GOOGLE_DRIVE_FOLDER from '@salesforce/schema/Account.Google_Drive_Folder__c';
import SALE_TYPE from '@salesforce/schema/Account.Sale_Type__c';

const FIELDS = [
  NAME, PHONE, BILLING_STREET, BILLING_CITY, BILLING_STATE, BILLING_POSTAL, BILLING_COUNTRY,
  SOLAR_PROGRAM_TYPE, PRIMARY_EMAIL, PROVINCE, ACCOUNT_STATUS, ACCOUNT_STAGE, TERRITORY, HOW_HEAR,
  AVG_UTILITY_BILL, ROOF, EXPECTED_LOAD_INCREASES, PROJECT_TYPE,
  REFERRED_BY, REFERRAL_TYPE, ROOF_AGE, PROPERTY_ID,
  HOME_OWNER_1, HOME_OWNER_2, HOME_OWNER_3, HOME_OWNER_1_FULLNAME,
  PROPOSAL, GOOGLE_DRIVE_FOLDER, SALE_TYPE
];

export default class ViewAccountOfflineV2 extends LightningElement {
  @api recordId;

  activeTab = 'details';

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  account;

  get hasData() { return !!this.account?.data; }
  get hasError() { return !!this.account?.error; }

  dvOrValue(field) {
    return getFieldDisplayValue(this.account.data, field) || getFieldValue(this.account.data, field) || '';
  }

  isHttpUrl(value) {
    const v = (value || '').trim();
    return v.startsWith('http://') || v.startsWith('https://');
  }

  get accountName() { return getFieldValue(this.account.data, NAME) || ''; }
  get primaryEmail() { return getFieldValue(this.account.data, PRIMARY_EMAIL) || ''; }
  get phone() { return getFieldValue(this.account.data, PHONE) || ''; }
  get phoneHref() { return this.phone ? `tel:${this.phone}` : ''; }

  get billingLine() {
    const street = getFieldValue(this.account.data, BILLING_STREET);
    const city = getFieldValue(this.account.data, BILLING_CITY);
    const state = getFieldValue(this.account.data, BILLING_STATE);
    const postal = getFieldValue(this.account.data, BILLING_POSTAL);
    const country = getFieldValue(this.account.data, BILLING_COUNTRY);
    const parts = [street, city, state, postal, country].filter(Boolean);
    return parts.length ? parts.join(', ') : '';
  }

  get solarProgramType() { return this.dvOrValue(SOLAR_PROGRAM_TYPE); }
  get province() { return this.dvOrValue(PROVINCE); }
  get territory() { return this.dvOrValue(TERRITORY); }
  get howDidYouHear() { return this.dvOrValue(HOW_HEAR); }

  get accountStatus() { return this.dvOrValue(ACCOUNT_STATUS); }
  get accountStage() { return this.dvOrValue(ACCOUNT_STAGE); }
  get saleType() { return this.dvOrValue(SALE_TYPE); }

  get avgUtilityBill() { return getFieldValue(this.account.data, AVG_UTILITY_BILL) || ''; }
  get roof() { return this.dvOrValue(ROOF); }
  get roofAge() { return getFieldValue(this.account.data, ROOF_AGE) || ''; }
  get propertyId() { return getFieldValue(this.account.data, PROPERTY_ID) || ''; }
  get projectType() { return this.dvOrValue(PROJECT_TYPE); }
  get expectedLoadIncreases() { return getFieldValue(this.account.data, EXPECTED_LOAD_INCREASES) || ''; }

  get referredById() { return getFieldValue(this.account.data, REFERRED_BY); }
  get referredByName() { return getFieldDisplayValue(this.account.data, REFERRED_BY) || this.referredById || ''; }
  get referralType() { return this.dvOrValue(REFERRAL_TYPE); }

  get homeOwner1Id() { return getFieldValue(this.account.data, HOME_OWNER_1); }
  get homeOwner2Id() { return getFieldValue(this.account.data, HOME_OWNER_2); }
  get homeOwner3Id() { return getFieldValue(this.account.data, HOME_OWNER_3); }

  get homeOwner1Name() {
    const dv = getFieldDisplayValue(this.account.data, HOME_OWNER_1);
    const full = getFieldValue(this.account.data, HOME_OWNER_1_FULLNAME);
    return dv || full || this.homeOwner1Id || '';
  }
  get homeOwner2Name() { return getFieldDisplayValue(this.account.data, HOME_OWNER_2) || this.homeOwner2Id || ''; }
  get homeOwner3Name() { return getFieldDisplayValue(this.account.data, HOME_OWNER_3) || this.homeOwner3Id || ''; }

  get proposalHref() {
    const v = getFieldValue(this.account.data, PROPOSAL) || '';
    return v;
  }

  get googleDriveFolder() { return getFieldValue(this.account.data, GOOGLE_DRIVE_FOLDER) || ''; }
  get googleDriveHref() { return this.isHttpUrl(this.googleDriveFolder) ? this.googleDriveFolder : ''; }

  handleTabClick(event) {
    this.activeTab = event.currentTarget.dataset.tab;
  }

  handleActionClose() {
    this.activeTab = 'details';
  }

  get isDetails() { return this.activeTab === 'details'; }
  get isRequestProposal() { return this.activeTab === 'requestProposal'; }
  get isSubmitSale() { return this.activeTab === 'submitSale'; }
  get isReferral() { return this.activeTab === 'referral'; }
  get isMarkLost() { return this.activeTab === 'markLost'; }
  get isNewOpportunity() { return this.activeTab === 'newOpportunity'; }

  tabClass(tabName) {
    return this.activeTab === tabName ? 'tab-btn tab-btn_active' : 'tab-btn';
  }

  get detailsTabClass() { return this.tabClass('details'); }
  get requestProposalTabClass() { return this.tabClass('requestProposal'); }
  get submitSaleTabClass() { return this.tabClass('submitSale'); }
  get referralTabClass() { return this.tabClass('referral'); }
  get markLostTabClass() { return this.tabClass('markLost'); }
  get newOpportunityTabClass() { return this.tabClass('newOpportunity'); }
}
