import { LightningElement, api } from 'lwc';

export default class SiteInspectionVerticalWrapper extends LightningElement {
    @api recordId;

    // default tab
    activeTab = 'structural';

    handleTabClick(event) {
        const tab = event.currentTarget.dataset.tab;
        this.activeTab = tab;
    }

    // Content helpers
    get isStructuralTabActive() {
        return this.activeTab === 'structural';
    }
    get isMainPanelTabActive() {
        return this.activeTab === 'mainPanel';
    }
    get isElectricalTabActive() {
        return this.activeTab === 'electrical';
    }
    get isGroundTabActive() {
        return this.activeTab === 'ground';
    }
    get isRoofTabActive() {
        return this.activeTab === 'roof';
    }
    get isSiteMapTabActive() {
        return this.activeTab === 'siteMap';
    }
    get isInspectorTabActive() {
        return this.activeTab === 'inspector';
    }
    get isSubPanelsTabActive() {
        return this.activeTab === 'subPanels';
    }

    // Button style helpers
    tabClass(tabName) {
        let base = 'si-tab-button';
        if (this.activeTab === tabName) {
            base += ' si-tab-button-active';
        }
        return base;
    }

    get tabClassStructural() {
        return this.tabClass('structural');
    }
    get tabClassMainPanel() {
        return this.tabClass('mainPanel');
    }
    get tabClassElectrical() {
        return this.tabClass('electrical');
    }
    get tabClassGround() {
        return this.tabClass('ground');
    }
    get tabClassRoof() {
        return this.tabClass('roof');
    }
    get tabClassSiteMap() {
        return this.tabClass('siteMap');
    }
    get tabClassInspector() {
        return this.tabClass('inspector');
    }
    get tabClassSubPanels() {
        return this.tabClass('subPanels');
    }
}
