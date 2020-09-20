import { LightningElement, api } from 'lwc';

export default class PageLayoutErrors extends LightningElement {
    @api errorEvent;    // Parses the onerror event from <lightning-record-form>
    
    get errorMessage() {
        // Top-level, ie: "An error occurred while trying to update the record"
        let message; // To be returned
        if (this.errorEvent && this.errorEvent.detail && this.errorEvent.detail.message) {
            message = this.errorEvent.detail.message;
        }
        return message;
    }

    get errorDetails() {
        // More granular, ie: "You cannot change the phone number for this account"
        let errorArray = []; // Array to be returned
        if (this.errorEvent && this.errorEvent.detail && this.errorEvent.detail.output && this.errorEvent.detail.output.errors) {
            let errors = this.errorEvent.detail.output.errors;
            for (let e = 0; e < errors.length; e++) {
                let error = "- " + errors[e].message;
                errorArray.push(error);
            }
        }
        return errorArray;
    }
}