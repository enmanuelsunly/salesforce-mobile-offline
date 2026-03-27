import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';

// Opportunity fields
import OPP_NAME from '@salesforce/schema/Opportunity.Name';
import CLOSE_DATE from '@salesforce/schema/Opportunity.CloseDate';
import STAGE_NAME from '@salesforce/schema/Opportunity.StageName';
import PROPOSAL from '@salesforce/schema/Opportunity.Proposal__c';

import SOLAR_PROGRAM_TYPE from '@salesforce/schema/Opportunity.Solar_Program_Type__c';
import PROPERTY_ID from '@salesforce/schema/Opportunity.Property_ID__c';
import SOLAR from '@salesforce/schema/Opportunity.Solar__c';
import BATTERY from '@salesforce/schema/Opportunity.Battery__c';

import OPEN_SOLAR_PROJECT_DESIGN from '@salesforce/schema/Opportunity.Open_Solar_Project_Design__c';

import PROJECT_STREET from '@salesforce/schema/Opportunity.Project_Street__c';
import CITY from '@salesforce/schema/Opportunity.City__c';
import PROVINCE from '@salesforce/schema/Opportunity.Province__c';
import POSTAL_CODE from '@salesforce/schema/Opportunity.Postal_Code__c';
import PID from '@salesforce/schema/Opportunity.PID__c';

import PRIMARY_RESIDENCE from '@salesforce/schema/Opportunity.Primary_Residence__c';
import ROOF_TYPE from '@salesforce/schema/Opportunity.Roof_type__c';
import ROOF_AGE from '@salesforce/schema/Opportunity.Roof_Age__c';
import PERMANENT_FOUNDATION from '@salesforce/schema/Opportunity.Permanent_Foundation__c';

import EXPECTED_LOAD_INCREASES from '@salesforce/schema/Opportunity.Expected_Load_Increases__c';
import UTILITY from '@salesforce/schema/Opportunity.Utility__c';

import FULL_NAME_ON_LDC_BILL from '@salesforce/schema/Opportunity.Full_Name_on_LDC_Bill__c';
import AVG_UTILITY_BILL from '@salesforce/schema/Opportunity.Avg_Utility_Bill__c';
import ACCOUNT_NUMBER_ON_LDC_BILL from '@salesforce/schema/Opportunity.Account_Number_on_LDC_Bill__c';

import HOMEOWNER1 from '@salesforce/schema/Opportunity.Homeowner1__c';
import HOMEOWNER2 from '@salesforce/schema/Opportunity.Homeowner_2__c';
import HOMEOWNER3 from '@salesforce/schema/Opportunity.Homeowner_3__c';

import SALE_TYPE from '@salesforce/schema/Opportunity.Sale_Type__c';
import LOSS_REASON from '@salesforce/schema/Opportunity.Loss_Reason__c';

// Related record fields (names)
import CONTACT_NAME from '@salesforce/schema/Contact.Name';

const FIELDS = [
    OPP_NAME,
    CLOSE_DATE,
    STAGE_NAME,
    PROPOSAL,
    SOLAR_PROGRAM_TYPE,
    PROPERTY_ID,
    SOLAR,
    BATTERY,
    OPEN_SOLAR_PROJECT_DESIGN,
    PROJECT_STREET,
    CITY,
    PROVINCE,
    POSTAL_CODE,
    PID,
    PRIMARY_RESIDENCE,
    ROOF_TYPE,
    ROOF_AGE,
    PERMANENT_FOUNDATION,
    EXPECTED_LOAD_INCREASES,
    UTILITY,
    FULL_NAME_ON_LDC_BILL,
    AVG_UTILITY_BILL,
    ACCOUNT_NUMBER_ON_LDC_BILL,
    HOMEOWNER1,
    HOMEOWNER2,
    HOMEOWNER3,
    SALE_TYPE,
    LOSS_REASON
];

export default class ViewOpportunityOffline extends LightningElement {
    @api recordId;

    activeTab = 'details';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    opp;

    // Lookups - IDs
    get homeowner1Id() { return getFieldValue(this.opp?.data, HOMEOWNER1); }
    get homeowner2Id() { return getFieldValue(this.opp?.data, HOMEOWNER2); }
    get homeowner3Id() { return getFieldValue(this.opp?.data, HOMEOWNER3); }
    get openSolarProjectDesignId() { return getFieldValue(this.opp?.data, OPEN_SOLAR_PROJECT_DESIGN); }

    // Lookups - name fetch fallback
    @wire(getRecord, { recordId: '$homeowner1Id', fields: [CONTACT_NAME] }) homeowner1Rec;
    @wire(getRecord, { recordId: '$homeowner2Id', fields: [CONTACT_NAME] }) homeowner2Rec;
    @wire(getRecord, { recordId: '$homeowner3Id', fields: [CONTACT_NAME] }) homeowner3Rec;

    // ----- load state -----
    get hasData() {
        return !!this.opp?.data;
    }

    get hasError() {
        return !!this.opp?.error;
    }

    // ----- helpers -----
    yesNo(v) {
        return v ? 'Yes' : 'No';
    }

    // ----- header / details getters -----
    get oppName() { return getFieldValue(this.opp.data, OPP_NAME) || ''; }
    get closeDate() { return getFieldValue(this.opp.data, CLOSE_DATE) || ''; }

    get stageName() {
        return getFieldDisplayValue(this.opp.data, STAGE_NAME) || getFieldValue(this.opp.data, STAGE_NAME) || '';
    }

    get proposalUrl() { return getFieldValue(this.opp.data, PROPOSAL) || ''; }

    get solarProgramType() {
        return getFieldDisplayValue(this.opp.data, SOLAR_PROGRAM_TYPE) || getFieldValue(this.opp.data, SOLAR_PROGRAM_TYPE) || '';
    }

    get propertyId() { return getFieldValue(this.opp.data, PROPERTY_ID) || ''; }

    get solarText() { return this.yesNo(getFieldValue(this.opp.data, SOLAR)); }
    get batteryText() { return this.yesNo(getFieldValue(this.opp.data, BATTERY)); }

    // Address-ish fields
    get projectStreet() { return getFieldValue(this.opp.data, PROJECT_STREET) || ''; }
    get city() { return getFieldValue(this.opp.data, CITY) || ''; }
    get province() { return getFieldDisplayValue(this.opp.data, PROVINCE) || getFieldValue(this.opp.data, PROVINCE) || ''; }
    get postalCode() { return getFieldValue(this.opp.data, POSTAL_CODE) || ''; }
    get pid() { return getFieldValue(this.opp.data, PID) || ''; }

    get primaryResidenceText() { return this.yesNo(getFieldValue(this.opp.data, PRIMARY_RESIDENCE)); }
    get roofType() { return getFieldDisplayValue(this.opp.data, ROOF_TYPE) || getFieldValue(this.opp.data, ROOF_TYPE) || ''; }
    get roofAge() { return getFieldValue(this.opp.data, ROOF_AGE) || ''; }
    get permanentFoundationText() { return this.yesNo(getFieldValue(this.opp.data, PERMANENT_FOUNDATION)); }

    get expectedLoadIncreases() { return getFieldValue(this.opp.data, EXPECTED_LOAD_INCREASES) || ''; }

    // Billing
    get utility() { return getFieldDisplayValue(this.opp.data, UTILITY) || getFieldValue(this.opp.data, UTILITY) || ''; }
    get fullNameOnLdcBill() { return getFieldValue(this.opp.data, FULL_NAME_ON_LDC_BILL) || ''; }
    get avgUtilityBill() { return getFieldValue(this.opp.data, AVG_UTILITY_BILL) || ''; }
    get accountNumberOnLdcBill() { return getFieldValue(this.opp.data, ACCOUNT_NUMBER_ON_LDC_BILL) || ''; }

    // Picklists
    get saleType() { return getFieldDisplayValue(this.opp.data, SALE_TYPE) || getFieldValue(this.opp.data, SALE_TYPE) || ''; }
    get lossReason() { return getFieldDisplayValue(this.opp.data, LOSS_REASON) || getFieldValue(this.opp.data, LOSS_REASON) || ''; }

    // Lookup Names (displayValue first, then fallback record)
    get homeowner1Name() {
        const display = getFieldDisplayValue(this.opp.data, HOMEOWNER1);
        const fallback = getFieldValue(this.homeowner1Rec?.data, CONTACT_NAME);
        return display || fallback || this.homeowner1Id || '';
    }

    get homeowner2Name() {
        const display = getFieldDisplayValue(this.opp.data, HOMEOWNER2);
        const fallback = getFieldValue(this.homeowner2Rec?.data, CONTACT_NAME);
        return display || fallback || this.homeowner2Id || '';
    }

    get homeowner3Name() {
        const display = getFieldDisplayValue(this.opp.data, HOMEOWNER3);
        const fallback = getFieldValue(this.homeowner3Rec?.data, CONTACT_NAME);
        return display || fallback || this.homeowner3Id || '';
    }

    // Open Solar Project Design (safe: displayValue or Id)
    get openSolarProjectDesignName() {
        const display = getFieldDisplayValue(this.opp.data, OPEN_SOLAR_PROJECT_DESIGN);
        return display || this.openSolarProjectDesignId || '';
    }

    // ----- tabs -----
    handleTabClick(event) {
        const { tab } = event.currentTarget.dataset;
        this.activeTab = tab;
    }

    handleActionClose() {
        this.activeTab = 'details';
    }

    get isDetails() { return this.activeTab === 'details'; }
    get isSubmitSale() { return this.activeTab === 'submitSale'; }
    get isReferral() { return this.activeTab === 'referral'; }

    tabClass(tabName) {
        return this.activeTab === tabName ? 'tab-btn tab-btn_active' : 'tab-btn';
    }

    get detailsTabClass() { return this.tabClass('details'); }
    get submitSaleTabClass() { return this.tabClass('submitSale'); }
    get referralTabClass() { return this.tabClass('referral'); }
}
