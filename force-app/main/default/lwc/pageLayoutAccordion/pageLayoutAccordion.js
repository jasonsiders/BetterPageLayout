import { LightningElement, api, wire } from 'lwc';
import { getRecordUi } from 'lightning/uiRecordApi';

export default class PageLayoutAccordion extends LightningElement {
    // --- Populated automatically by the framework ---
    @api recordId;          // The current record the component sits on; used to wire data
    @api objectApiName;     // The object apiName of the current record; used to wire data
    sections;               // Populated via wire; array of section objects to display on the component

    @wire(getRecordUi, { recordIds: '$recordId', layoutTypes: 'Full', modes: 'View' })
    response ({ error, data }) {
        if (data) {
            // Get the name of each section to display on the component
            let sections = [];
            let recordTypeId = data.records[this.recordId].recordTypeId;
            let layout = data.layouts[this.objectApiName][recordTypeId].Full.View.sections;
            for (let i = 0; i < layout.length; i++) {
                if (this.checkVisibility(layout[i])) {
                    let section = { Id: (i + 1), name: layout[i].heading }
                    sections.push(section);
                }
            }
            this.sections = sections.length > 0 ? sections : {};
        }
    }

    checkVisibility(section) {
        // Do not add a section to the layout if it does not contain at least one field
        // To account for standard page layout sections that do not contain fields 
        // (and therefore, are not supported), but cannot be removed either  (i.e., "Custom Links" on Opportunity)
        let visible = false;
        for (let a = 0; a < section.layoutRows.length; a++) {
            let layoutRow = section.layoutRows[a];
            for (let b = 0; b < layoutRow.layoutItems.length; b++) {
                let layoutItem = layoutRow.layoutItems[b];
                for (let c = 0; c < layoutItem.layoutComponents.length; c++) {
                    let layoutComponent = layoutItem.layoutComponents[c];
                    if (!visible && layoutComponent.componentType === "Field") {
                        visible = true;
                        break;
                    }
                }
            }
        }
        return visible;
    }
}