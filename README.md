# salesforce-mobile-offline

Offline-first Salesforce mobile app built for **Sunly Energy** field teams. Covers site inspections, account management, opportunities, and project reports  all functional without internet, syncing automatically when connectivity returns.

Built with **Lightning Web Components (LWC)**, **Briefcase Builder**, and **Record-Triggered Flows**.

---

## What This Solves

Field teams in low-signal areas were losing deal data. Standard Salesforce Mobile does not support offline editing out of the box, and the default UI breaks entirely without a connection.

This project fixes that by building a custom offline architecture on top of Salesforce Mobile SDK  giving reps a fully functional app whether they have LTE or not.

---

## Objects Covered

| Object | Type | Offline Ready |
|---|---|---|
| Account | Standard | Yes |
| Opportunity | Standard | Yes |
| Site_Inspection__c | Custom | Yes |
| Project Report | Custom UI | Yes |
| Offline_Event__c | Mirror (custom) | Yes |

> The standard Event object is not fully supported offline. We mirror it into `Offline_Event__c` via a Record-Triggered Flow.

---

## Tech Stack

- **Salesforce LWC**  UI components (offline-compatible subset only)
- **Lightning Data Service (LDS)**  `@wire(getRecord)`, `updateRecord()`
- **Briefcase Builder**  offline data priming per user/role
- **Record-Triggered Flows**  Event mirroring, contact matching, notifications
- **Salesforce Mobile SDK**  offline sync engine
- **Salesforce CLI**  offline sync engine

---

## Quick Start Guide
This quick start shows you how to view a custom record type offline. For records in the Starter Kit, you can use the corresponding existing Lightning Web Components (LWC) and modify it to your needs.
- Set up your development environment.
- Configure your Offline Briefcase to include the objects that you want to view offline.
- Follow the steps in the Define an Offline Briefcase section.
- The Briefcase Builder help documentation and Offline Briefcase Trailhead module are excellent resources to help you create a briefcase, set of rules, and filters that select records for offline use for your org.



## Architecture

Every object follows the same pattern:

```
View LWC (entry point)
    |
    |--- Details Tab (read-only fields)
    |--- Action Tab 1 (e.g. Submit Sale)
    |--- Action Tab 2 (e.g. Referral)
    |--- Action Tab N
         |
         Action Wrapper LWC
              |
              Action LWC (draft + updateRecord)
```

Each action uses:

```js
// Read
@wire(getRecord, { recordId, fields })

// Write
updateRecord({ fields: { Id: recordId, ...draft } })
```

No imperative Apex. No dynamic SOQL. Everything goes through LDS.

---

## Event Mirroring Flow

Since the standard Event object has limited offline support:

```
Event (created or updated)
    |
    Record-Triggered Flow (After Save)
    |
    Get Offline_Event__c by Event_Id__c
    |
    Found?     --> Update existing record
    Not Found? --> Create new record
```

Critical detail: always use `Triggering Event > Activity ID` in Flow, not `Record ID`. These are different things in Flow context and mixing them up causes silent failures.

---

## Offline Rules

These are hard constraints. Breaking them means the app silently fails on mobile.

### 1. Every object needs a `.view` Quick Action

Without it, Salesforce Mobile shows a blank screen or "No LWC component" error. No warning, no fallback.

### 2. You cannot modify an existing LWC's `targets` or `targetConfigs`

Once a component is used in a Quick Action, Salesforce locks those metadata properties.

Fix: create a V2 component.

```
viewAccountOffline  -->  viewAccountOfflineV2
```

### 3. These components do NOT work offline

| Broken | Replacement |
|---|---|
| `<lightning-record-edit-form>` | `<lightning-input>` |
| `<lightning-formatted-address>` | Plain text field |
| `<lightning-input-rich-text>` | `<lightning-textarea>` |

### 4. Lookup fields display IDs offline, not names

```
Sales_Rep__c  -->  005XXXXXXXX
```

Fix with a second wire:

```js
@wire(getRecord, { recordId: lookupId, fields: ['User.Name'] })
```

Or use `getFieldDisplayValue()` if the field is already loaded.

### 5. Never hardcode picklist values

Use `getObjectInfo` + `getPicklistValues`. Even then, picklists can return empty offline if metadata was not cached during the last sync. Plan for that in the UI.

### 6. Quick Action XML does not support `<formFactor>Small</formFactor>`

Only `<actionType>ScreenAction</actionType>` is supported. Anything else is silently ignored on mobile.

---

## CSS Filename Rule

This one will waste an hour if you miss it.

If your component is named `viewAccountOfflineV2`, the CSS file **must** be:

```
viewAccountOfflineV2.css
```

Not `viewAccountOffline.css`. Salesforce does not throw an error  it just does not apply the styles.

---

## Global UI System

All components share the same design system. Do not deviate from these unless you update all objects.

### Font Scale

```css
.page-title     { font-size: 1.294rem; }
.summary-title  { font-size: 1.254rem; }
.section-header { font-size: 1.011rem; }
.field-label    { font-size: 0.93rem; }
.field-value    { font-size: 0.874rem; }
.tab-btn        { font-size: 0.926rem; }
```

### Tab Active State

```css
background: #fff2c2;
border: 2px solid #f2c84b;
```

### Layout Order (top to bottom)

1. Icon row (blue circles, horizontal scroll)
2. Summary card (bold title, key fields)
3. Tab grid (2 columns, rounded buttons)
4. Section blocks (Header > Card > Fields)

### Field Display

```
Label  -->  bold
Value  -->  normal weight
```

### Project Report Exception

Project Report uses legacy class names from an earlier build. Map them like this:

```
.name         --> .summary-title
.tile         --> .tab-btn
.sectionTitle --> .section-header
.k            --> .field-label
.v            --> .field-value
```

---

## Offline Setup Checklist

Use this every time you add a new object.

```
[ ] Create View LWC
[ ] Create Action LWC(s)
[ ] Create Wrapper LWC(s) for each action
[ ] Create .quickAction-meta.xml for each action
[ ] Add Quick Actions to Page Layout
    (Salesforce Mobile and Lightning Experience Actions section)
[ ] Add object to Briefcase Builder
[ ] Add related objects needed for lookup name resolution
[ ] Assign Briefcase to user or app
[ ] On mobile: refresh "My Offline Records"
[ ] Verify sync completed
```

---

## Web-to-Case Integration

External forms post to:

```
https://webto.salesforce.com/servlet/servlet.WebToCase
```

### Correct Field Names

| Label | API Name |
|---|---|
| Contact Name | `suppliedName` |
| Email | `suppliedEmail` |
| Phone | `suppliedPhone` |
| Subject | `subject` |
| Description | `description` |

> `ContactId` (lookup) cannot be populated via Web-to-Case. Use a Record-Triggered Flow to match by email after creation.

### Contact Matching Flow Logic

```
Trigger: Case created
If ContactId IS NULL AND SuppliedEmail IS NOT NULL
    Get Contact where Email = Case.SuppliedEmail
    If found: set Case.ContactId = Contact.Id
```

---

## Common Errors and Fixes

| Error | Cause | Fix |
|---|---|---|
| Component not showing | Missing `.view` quick action | Create and assign it |
| Cannot change LWC type | Metadata locked | Create V2 component |
| Styles not applying | CSS filename mismatch | Match filename exactly to component name |
| Picklist empty on mobile | Metadata not cached | Add object to Briefcase, resync |
| Lookup shows ID | Name not fetched offline | Add second `@wire(getRecord)` |
| Action not visible on mobile | Wrong page layout | Add to Mobile Actions section |
| Module not found | Wrapper component name mismatch | Match wrapper name to import exactly |
| Duplicate Offline_Events | `Event_Id__c` not mapped in Create step | Add field mapping in Flow Create element |
| Flow not triggering | Flow not activated | Activate and verify trigger is Created OR Updated, After Save |

---

## Repo Structure

```
force-app/
  main/
    default/
      lwc/
        viewAccountOfflineV2/
        submitSaleAction/
        referralAction/
        markLostAction/
        viewOpportunityOffline/
        viewSiteInspection/
        viewProjectReport/
      quickActions/
      flows/
        Event_To_Offline_Event.flow-meta.xml
        Case_Contact_Match.flow-meta.xml
      objects/
        Offline_Event__c/
```

---

## Adding a New Object

1. Copy an existing View LWC (Opportunity is the cleanest base)
2. Update `@wire(getRecord)` fields to match the new object
3. Add tabs for each workflow the object needs
4. Create Action LWCs using the draft + `updateRecord` pattern
5. Create Wrappers for each action
6. Create Quick Actions and add to Page Layout
7. Add the object to Briefcase Builder
8. Test offline by putting the device in airplane mode before opening the record

---
## Tools and Setup
 
This is everything you need installed before touching any code.
 
### 1. Node.js
 
The Salesforce CLI runs on Node.js. Install the LTS version.
 
```
https://nodejs.org/en/download
```
 
Verify after install:
 
```bash
node --version
npm --version
```
 
---
 
### 2. Salesforce CLI (sf v2)
 
The main tool for deploying LWCs, metadata, and Quick Actions to your org. The old `sfdx` (v7) is deprecated. Use `sf` (v2).
 
```bash
npm install --global @salesforce/cli
```
 
Verify:
 
```bash
sf version
```
 
If you already have `sfdx` installed, uninstall it first or you will get a conflict:
 
```bash
# uninstall old CLI first
npm uninstall --global sfdx-cli
 
# then install sf v2
npm install --global @salesforce/cli
```
 
Official install docs: https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_install_cli.htm
 
---
 
### 3. Visual Studio Code
 
Download at:
 
```
https://code.visualstudio.com
```
 
---
 
### 4. VS Code Extensions
 
Install all three of these:
 
| Extension | Purpose | Link |
|---|---|---|
| Salesforce Extension Pack | Core LWC + Apex + Org auth | https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode |
| Lightning Web Components | LWC syntax highlighting + autocomplete | https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-lwc |
| Salesforce Mobile Extensions | Offline LWC linting + onboarding wizard + test harness | https://marketplace.visualstudio.com/items?itemName=salesforce.salesforcedx-vscode-mobile |
 
The Mobile Extensions one is the most important for this project. It runs ESLint rules that catch offline violations before you deploy them. It also gives you the LWC Test Harness, which lets you debug components in a simulated offline state without needing a physical device every time.
 
---
 
### 5. ESLint Plugin for LWC Mobile
 
Install this in your project root so ESLint flags offline anti-patterns as you code:
 
```bash
npm install --save-dev @salesforce/eslint-plugin-lwc-mobile
```
 
Then update your `.eslintrc.json`:
 
```json
{
  "extends": ["eslint:recommended", "plugin:@salesforce/lwc-mobile/recommended"]
}
```
 
This catches things like imperative Apex calls, unsupported components, and oversized GraphQL fields before they blow up on device.
 
---
 
### 6. Git
 
For cloning and version control.
 
```
https://git-scm.com/downloads
```
 
---
 
## Key Commands
 
Authenticate to your org:
 
```bash
sf org login web --alias my-org
```
 
Deploy a single LWC:
 
```bash
sf project deploy start -p force-app/main/default/lwc/viewAccountOfflineV2
```
 
Deploy a Quick Action:
 
```bash
sf project deploy start -p force-app/main/default/quickActions/Account.view.quickAction-meta.xml
```
 
Deploy everything at once:
 
```bash
sf project deploy start -p force-app/
```
 
Pull changes from org back to local:
 
```bash
sf project retrieve start -p force-app/
```
 
---
 
## Offline Starter Kit
 
The official Salesforce offline starter kit. Contains working examples of `.view`, `.edit`, and `.create` Quick Actions, lookup handling, related records via GraphQL, and Briefcase setup. Use it as a reference when building new components.
 
```
https://github.com/salesforce/offline-app-developer-starter-kit
```
 
Clone it separately from this repo:
 
```bash
git clone https://github.com/salesforce/offline-app-developer-starter-kit.git
```
 
Check out a stable tagged release instead of running HEAD:
 
```bash
git tag -l
git checkout v242.3.0
```
 
---
 
## Learning Resources
 
### Offline and Mobile
 
| Resource | What it covers | Link |
|---|---|---|
| Mobile and Offline Developer Guide | Official reference for LWC offline, wire adapters, Quick Actions | https://developer.salesforce.com/docs/atlas.en-us.mobile_offline.meta/mobile_offline/intro.htm |
| Offline Briefcase Trailhead | Briefcase Builder setup, filters, and user assignments | https://trailhead.salesforce.com/content/learn/modules/offline-briefcase |
| Offline Starter Kit | Working code examples for every offline pattern | https://github.com/salesforce/offline-app-developer-starter-kit |
| Build Better LWCs for Offline | ESLint rules, mobile tools, GraphQL queries for offline | https://developer.salesforce.com/blogs/2025/04/build-better-lwcs-for-offline-usage-with-salesforce-mobile-tools |
| Offline App Onboarding Wizard | How to use the wizard and test harness | https://developer.salesforce.com/blogs/2023/07/introducing-the-salesforce-offline-app-onboarding-wizard |
 
### LWC Fundamentals
 
| Resource | What it covers | Link |
|---|---|---|
| Build Lightning Web Components Trail | Full LWC trail from scratch | https://trailhead.salesforce.com/content/learn/trails/build-lightning-web-components |
| LWC Developer Guide | Wire adapters, component lifecycle, LDS | https://developer.salesforce.com/docs/component-library/documentation/en/lwc |
 
### Salesforce CLI
 
| Resource | Link |
|---|---|
| CLI Setup Guide | https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm |
| CLI Command Reference | https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_unified.htm |
 
---
 
## Contact
 
Built by **Enmanuel Mateo** — Salesforce Developer / Site Inspector at Sunly Energy.
 
Questions about the offline architecture, LWC patterns, or Briefcase configuration: reach out before changing anything in the Flow or Quick Action layer. Small changes there break things silently.
