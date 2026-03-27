import { LightningElement, api } from 'lwc';
import { CloseActionScreenEvent } from 'lightning/actions';

export default class SiteInspectionGroundOfflineActionWrapper extends LightningElement {
    @api recordId;

    handleClose() {
        // Called when inner component dispatches `new CustomEvent('close')`
        this.dispatchEvent(new CloseActionScreenEvent());
    }
}
