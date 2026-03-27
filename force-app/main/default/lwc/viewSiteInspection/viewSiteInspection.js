import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';

// Schema imports
import SITE_INSPECTION_NAME from '@salesforce/schema/Site_Inspection__c.Name';
import ACCOUNT from '@salesforce/schema/Site_Inspection__c.Account__c';
import OPPORTUNITY from '@salesforce/schema/Site_Inspection__c.Opportunity__c';
import ROOF_CONDITION from '@salesforce/schema/Site_Inspection__c.Roof_Condition__c';
import INSPECTOR_NOTES from '@salesforce/schema/Site_Inspection__c.Inspector_Notes__c';

const FIELDS = [
    SITE_INSPECTION_NAME,
    ACCOUNT,
    OPPORTUNITY,
    ROOF_CONDITION,
    INSPECTOR_NOTES
];

export default class ViewSiteInspection extends LightningElement {
    @api recordId;

    // default tab
    activeTab = 'details';

    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    inspection;

    // ----- load state -----
    get hasData() {
        return this.inspection && this.inspection.data;
    }

    get hasError() {
        return this.inspection && this.inspection.error;
    }

    // ----- record getters -----
    get name() {
        return getFieldValue(this.inspection.data, SITE_INSPECTION_NAME) || '';
    }

    // Lookup fields: try display value first (better UX), fallback to Id
    get account() {
        return (
            getFieldDisplayValue(this.inspection.data, ACCOUNT) ||
            getFieldValue(this.inspection.data, ACCOUNT) ||
            ''
        );
    }

    get opportunity() {
        return (
            getFieldDisplayValue(this.inspection.data, OPPORTUNITY) ||
            getFieldValue(this.inspection.data, OPPORTUNITY) ||
            ''
        );
    }

    get roofCondition() {
        return (
            getFieldDisplayValue(this.inspection.data, ROOF_CONDITION) ||
            getFieldValue(this.inspection.data, ROOF_CONDITION) ||
            ''
        );
    }

    get inspectorNotes() {
        return getFieldValue(this.inspection.data, INSPECTOR_NOTES) || '';
    }

    // ----- tab state -----
    handleTabClick(event) {
        const { tab } = event.currentTarget.dataset;
        this.activeTab = tab;
    }

    get isDetails() { return this.activeTab === 'details'; }
    get isStructural() { return this.activeTab === 'structural'; }
    get isMainPanel() { return this.activeTab === 'mainPanel'; }
    get isElectrical() { return this.activeTab === 'electrical'; }
    get isGround() { return this.activeTab === 'ground'; }
    get isRoof() { return this.activeTab === 'roof'; }
    get isSiteMap() { return this.activeTab === 'siteMap'; }
    get isInspectorNotes() { return this.activeTab === 'inspectorNotes'; }
    get isSubPanels() { return this.activeTab === 'subPanels'; }

    // ----- button classes (Project Report style) -----
    tabClass(tabName) {
        return this.activeTab === tabName ? 'tab-btn tab-btn_active' : 'tab-btn';
    }

    get detailsTabClass() { return this.tabClass('details'); }
    get structuralTabClass() { return this.tabClass('structural'); }
    get mainPanelTabClass() { return this.tabClass('mainPanel'); }
    get electricalTabClass() { return this.tabClass('electrical'); }
    get groundTabClass() { return this.tabClass('ground'); }
    get roofTabClass() { return this.tabClass('roof'); }
    get siteMapTabClass() { return this.tabClass('siteMap'); }
    get inspectorNotesTabClass() { return this.tabClass('inspectorNotes'); }
    get subPanelsTabClass() { return this.tabClass('subPanels'); }
}
