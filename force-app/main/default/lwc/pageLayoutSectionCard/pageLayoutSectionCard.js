import { LightningElement, api, wire } from 'lwc';
import { getRecordUi } from 'lightning/uiRecordApi';

export default class PageLayoutSectionCard extends LightningElement {
    @api recordId;          // Auto-populated from flexipage; passes to <c-object-icon>
    @api objectApiName;     // Auto-populated from flexipage; passes to <c-object-icon>
    @api sectionName;       // Name of the section to be loaded/stored in sectionInfo
    @api headerMode;        // Options: Full, No Icon, Hidden
    displaySection = false; // Wire sets to true if section exists and has at least 1 field

    @wire(getRecordUi, { recordIds: '$recordId', layoutTypes: 'Full', modes: 'View' }) 
    response ({ error, data }) {
        if (data && this.sectionName && !this.displaySection) {
            this.validateSection(data);
        }
    }
    
    get showTitle() {
        return (this.headerMode !== "Hidden" && this.sectionName) ? true : false;
    }

    get showIcon() {
        return this.headerMode === "Full" ? true : false;
    }

    validateSection(responseData) {
        // Verify the section exists and has at least one field to display
        let recordTypeId = responseData.records[this.recordId].recordTypeId;
        let sections = responseData.layouts[this.objectApiName][recordTypeId].Full.View.sections;
        for (let a = 0; a < sections.length; a++) {
            let section = sections[a];
            if (section.heading === this.sectionName) {
                for (let b = 0; b < section.layoutRows.length; b++) {
                    let layoutRow = section.layoutRows[b];
                    for (let c = 0; c < layoutRow.layoutItems.length; c++) {
                        let layoutItem = layoutRow.layoutItems[c];
                        for (let d = 0; d < layoutItem.layoutComponents.length; d++) {
                            let layoutComponent = layoutItem.layoutComponents[d];
                            if (layoutComponent.componentType === "Field") {
                                this.displaySection = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}