import { LightningElement, api, wire } from 'lwc';

export default class BetterPageLayout extends LightningElement {
    /********************************** VARIABLES ***************************************/
    // --- Populated automatically by the flexipage ---
    @api recordId;
    @api objectApiName;

    // --- Public properties: populated via flexipage ---
    @api mode = "Accordion"; // Options: Accordion (default), Tabs

    // --- Getters ---
    get accordion() {
        return this.mode === "Accordion" ? true : false;
    }

    get tabs() {
        return this.mode === "Tabs" ? true : false;
    }
}