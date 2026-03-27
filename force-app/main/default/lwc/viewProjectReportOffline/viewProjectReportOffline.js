import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';

// Object: Polaron_Project_Report__c
import NAME from '@salesforce/schema/Polaron_Project_Report__c.Name';
import ACCOUNT from '@salesforce/schema/Polaron_Project_Report__c.Account__c';

import KEY_INSTALL_DETAILS from '@salesforce/schema/Polaron_Project_Report__c.Key_Install_Details__c';
import CLIENT_ADDRESS from '@salesforce/schema/Polaron_Project_Report__c.Client_Address__c';

import INSTALLATION_TYPE from '@salesforce/schema/Polaron_Project_Report__c.Installation_Type__c';
import INSTALLATION_STATUS from '@salesforce/schema/Polaron_Project_Report__c.Installation_Status__c';

import NOTES_FOR_INSTALLERS from '@salesforce/schema/Polaron_Project_Report__c.Notes_for_Installers__c';
import ELECTRICIAN_NOTES from '@salesforce/schema/Polaron_Project_Report__c.Electrician_Notes__c';

import AC_FOLDER from '@salesforce/schema/Polaron_Project_Report__c.AC_Folder__c';
import DC_FOLDER from '@salesforce/schema/Polaron_Project_Report__c.DC_Folder__c';

import SITE_INSPECTION_PATH from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Path__c';
import NOTES_FOR_SITE_INSPECTION from '@salesforce/schema/Polaron_Project_Report__c.Notes_for_Site_Inspection__c';

import SITE_INSPECTION_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Complete__c';
import SITE_INSPECTION_UPLOADED from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Uploaded__c';

import SI_ELECTRICAL_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Electrical_Complete__c';
import SI_STRUCTURAL_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Structural_Complete__c';
import SI_DRONE_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Drone_Complete__c';
import SI_ADDITIONAL_COMPLETE from '@salesforce/schema/Polaron_Project_Report__c.SI_Additional_Complete__c';

import SITE_INSPECTION_GOOGLE from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Google__c';
import SITE_INSPECTION_FOLDER from '@salesforce/schema/Polaron_Project_Report__c.Site_Inspection_Folder__c';

// Related record name (Account)
import ACCOUNT_NAME from '@salesforce/schema/Account.Name';

const FIELDS = [
  NAME,
  ACCOUNT,
  KEY_INSTALL_DETAILS,
  CLIENT_ADDRESS,
  INSTALLATION_TYPE,
  INSTALLATION_STATUS,
  NOTES_FOR_INSTALLERS,
  ELECTRICIAN_NOTES,
  AC_FOLDER,
  DC_FOLDER,
  SITE_INSPECTION_PATH,
  NOTES_FOR_SITE_INSPECTION,
  SITE_INSPECTION_COMPLETE,
  SITE_INSPECTION_UPLOADED,
  SI_ELECTRICAL_COMPLETE,
  SI_STRUCTURAL_COMPLETE,
  SI_DRONE_COMPLETE,
  SI_ADDITIONAL_COMPLETE,
  SITE_INSPECTION_GOOGLE,
  SITE_INSPECTION_FOLDER
];

export default class ViewProjectReportOffline extends LightningElement {
  @api recordId;

  selected = 'details';
  errorMessage;

  @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
  projectReport;

  // Fetch Account Name reliably (displayValue sometimes missing offline)
  get accountId() {
    return getFieldValue(this.projectReport?.data, ACCOUNT);
  }

  @wire(getRecord, { recordId: '$accountId', fields: [ACCOUNT_NAME] })
  accountRecord;

  get hasData() {
    return !!this.projectReport?.data;
  }

  // Header / Overview
  get projectName() {
    return getFieldValue(this.projectReport.data, NAME) || '';
  }

  get accountName() {
    const display = getFieldDisplayValue(this.projectReport.data, ACCOUNT);
    const fallback = getFieldValue(this.accountRecord?.data, ACCOUNT_NAME);
    return display || fallback || this.accountId || '';
  }

  get clientAddress() {
    return getFieldValue(this.projectReport.data, CLIENT_ADDRESS) || '';
  }

  get installationType() {
    return (
      getFieldDisplayValue(this.projectReport.data, INSTALLATION_TYPE) ||
      getFieldValue(this.projectReport.data, INSTALLATION_TYPE) ||
      ''
    );
  }

  get installationStatus() {
    return (
      getFieldDisplayValue(this.projectReport.data, INSTALLATION_STATUS) ||
      getFieldValue(this.projectReport.data, INSTALLATION_STATUS) ||
      ''
    );
  }

  // Install
  get keyInstallDetails() {
    return getFieldValue(this.projectReport.data, KEY_INSTALL_DETAILS) || '';
  }

  get notesForInstallers() {
    return getFieldValue(this.projectReport.data, NOTES_FOR_INSTALLERS) || '';
  }

  // Notes
  get electricianNotes() {
    return getFieldValue(this.projectReport.data, ELECTRICIAN_NOTES) || '';
  }

  // Site Inspection summary
  get siteInspectionPath() {
    return (
      getFieldDisplayValue(this.projectReport.data, SITE_INSPECTION_PATH) ||
      getFieldValue(this.projectReport.data, SITE_INSPECTION_PATH) ||
      ''
    );
  }

  get notesForSiteInspection() {
    return getFieldValue(this.projectReport.data, NOTES_FOR_SITE_INSPECTION) || '';
  }

  // Folder formulas
  get acFolder() {
    return getFieldValue(this.projectReport.data, AC_FOLDER) || '';
  }
  get dcFolder() {
    return getFieldValue(this.projectReport.data, DC_FOLDER) || '';
  }
  get siteInspectionGoogle() {
    return getFieldValue(this.projectReport.data, SITE_INSPECTION_GOOGLE) || '';
  }
  get siteInspectionFolder() {
    return getFieldValue(this.projectReport.data, SITE_INSPECTION_FOLDER) || '';
  }

  // Checkbox display helpers
  yesNo(val) {
    return val ? 'Yes' : 'No';
  }

  get siteInspectionCompleteText() {
    return this.yesNo(getFieldValue(this.projectReport.data, SITE_INSPECTION_COMPLETE));
  }
  get siteInspectionUploadedText() {
    return this.yesNo(getFieldValue(this.projectReport.data, SITE_INSPECTION_UPLOADED));
  }
  get siElectricalCompleteText() {
    return this.yesNo(getFieldValue(this.projectReport.data, SI_ELECTRICAL_COMPLETE));
  }
  get siStructuralCompleteText() {
    return this.yesNo(getFieldValue(this.projectReport.data, SI_STRUCTURAL_COMPLETE));
  }
  get siDroneCompleteText() {
    return this.yesNo(getFieldValue(this.projectReport.data, SI_DRONE_COMPLETE));
  }
  get siAdditionalCompleteText() {
    return this.yesNo(getFieldValue(this.projectReport.data, SI_ADDITIONAL_COMPLETE));
  }

  // Section flags
  get isDetails() { return this.selected === 'details'; }

  // Actions flags
  get isActionDc() { return this.selected === 'actionDc'; }
  get isActionAc() { return this.selected === 'actionAc'; }
  get isActionSi() { return this.selected === 'actionSi'; }
  get isActionTrench() { return this.selected === 'actionTrench'; }

  get isActionMode() {
    return (
      this.selected === 'actionDc' ||
      this.selected === 'actionAc' ||
      this.selected === 'actionSi' ||
      this.selected === 'actionTrench'
    );
  }

  tileClass(section) {
    return this.selected === section ? 'tile active' : 'tile';
  }

  get detailsBtnClass() { return this.tileClass('details'); }
  get dcEndOfDayBtnClass() { return this.tileClass('actionDc'); }
  get acEndOfDayBtnClass() { return this.tileClass('actionAc'); }
  get siteInspectionActionBtnClass() { return this.tileClass('actionSi'); }
  get trenchingEndOfDayBtnClass() { return this.tileClass('actionTrench'); }


  // Section navigation
  openDetails() { this.selected = 'details'; }

  // Actions navigation
  openDcEndOfDay() { this.selected = 'actionDc'; }
  openAcEndOfDay() { this.selected = 'actionAc'; }
  openSiteInspectionAction() { this.selected = 'actionSi'; }
  openTrenchingEndOfDay() { this.selected = 'actionTrench'; }

  // Called by child action components (they dispatch "close")
  handleActionClose() {
    this.selected = 'details';
  }
}