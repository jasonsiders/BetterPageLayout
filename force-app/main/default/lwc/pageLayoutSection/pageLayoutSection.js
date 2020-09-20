import { LightningElement, api, wire } from 'lwc';
import { getRecordUi } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class HouzzPageLayoutSection extends LightningElement {
    /********************************** VARIABLES ***************************************/
    // --- Public properties: Passed from parent component --- 
    @api recordId;          // Used to retreive wire data
    @api objectApiName;     // Used to retreive wire data
    @api sectionName;       // Name of the section to be loaded/stored in sectionInfo
                            //  - If more than one of the same name, just the first will be returned
                            //  - If no matching sections are found, component will hide completely
    @api outerClass = "slds-var-m-horizontal_large slds-var-p-bottom_small"; // Customize outer div styling (ie., add borders, margin/padding, etc.)
                                                                        
    // --- Wire variables --- 
    layoutMode = 'View';    // needed in order to retreive sectionInfo
    layoutType = 'Full';    // needed in order to retreive sectionInfo
    recordTypeId;           // needed in order to retrieve sectionInfo
    sectionInfo;            // The main data variable
    themeInfo;              // iconUrl and color to construct a custom icon

    // --- Interaction Variables --- 
    displaySpinner = false; // When true, displays spinner; set after load by wire method
    editMode = false;       // When true, shows the edit form. Set from onclick events
    error;                  // Populated via wire or onerror methods; error panel will display

    /********************************** DATA METHODS ************************************/
    @wire(getRecordUi, { recordIds: '$recordId', layoutTypes: '$layoutType', modes: '$layoutMode' })
    response ({ error, data }) {
        if (data) {
            if (!this.recordTypeId || !this.sectionInfo) {
                this.toggleSpinner();
                this.error = undefined;
                this.getSectionInfo(data);
                this.toggleSpinner();
            }
        }
        else if (error) {
            // Fail gracefully; set sectionInfo to null and hide the component
            this.error = error;
            this.sectionInfo = {};
            this.toggleSpinner();
        }
    }

    getSectionInfo(wireResponse) {
        // Once the response is fetched, this method parses the data into a section object, 
        /// which is used to construct the record edit/view forms

        // Clear/reconstruct the section object to avoid the same data being added twice
        this.sectionInfo = {}; 
        let section = { title: null, editable: false,  rows: []  };

        // Get the RecordTypeId for further processing
        this.recordTypeId = wireResponse.records[this.recordId].recordTypeId;

        // Condense the response to the relevant sections only
        let sectionData = wireResponse.layouts[this.objectApiName][this.recordTypeId][this.layoutType][this.layoutMode].sections;
        let objectData = wireResponse.objectInfos[this.objectApiName];

        // Iterate through sections and stop once the correct section is found
        for (let a = 0; a < sectionData.length; a++) {
            // Only return the relevant section data
            if (sectionData[a].heading === this.sectionName) {
                section.title = sectionData[a].heading;

                // Iterate through layoutRows
                let layoutRows = sectionData[a].layoutRows;
                for (let b = 0; b < layoutRows.length; b++) {
                    let row = { columns: [] };
                    
                    // Iterate through layoutItems
                    let layoutItems = layoutRows[b].layoutItems;
                    for (let c = 0; c < layoutItems.length; c++) {
                        // Column object to be added to each row
                        let column = {isField: false, fieldName: null, fieldLabel: null, fieldDate: null, editable: false };
                        
                        // Current layoutItem
                        let layoutItem = layoutItems[c];

                        // If a field label is specified in layoutItems, use this - 
                        // this is more reliable than the objectData.fields (w/exceptions below)
                        column.fieldLabel = layoutItem.label ? layoutItem.label : null;

                        // Iterate through layoutComponents
                        let layoutComponents = layoutItem.layoutComponents;
                        if (layoutComponents.length > 0) {
                            let layoutComponent = layoutComponents[0];
                            let theField = layoutComponent.apiName;
                            let fieldDef = objectData.fields[theField];
                            
                            // Check if Field or something else (like EmptySpace)
                            column.isField = layoutComponent.componentType === "Field" ? true : false;
                        
                            // Get metadata for each field
                            if (column.isField && fieldDef.compoundFieldName) {
                                // Compound fields: multiple layoutComonents per column
                                // Need to get the parent field instead
                                let parentField = objectData.fields[fieldDef.compoundFieldName];
                                column.fieldName = parentField.apiName;
                                column.fieldLabel = parentField.label;
                            }
                            else if (column.isField && (theField === 'CreatedById' || theField === 'CreatedDate' || theField === 'LastModifiedById' || theField === 'LastModifiedDate')) {
                                // System Fields: Last Modified By and Created By
                                // Will have a date underneath the User lookup field
                                column.fieldLabel = theField.startsWith('Created') ? 'Created By' : 'Last Modified By';
                                column.fieldName = theField.startsWith('Created') ? 'CreatedById' : 'LastModifiedById';
                                column.fieldDate = theField.startsWith('Created') ? 'CreatedDate' : 'LastModifiedDate';
                            }
                            else if (column.isField && theField === "RecordTypeId") {
                                // RecordTypeId - not supported by lightning-input/output field base component
                                // To get around this, we do not render it via the apiName
                                // Instead, manually display the name of the record type
                                column.fieldLabel ? column.fieldLabel : fieldDef.label;
                                column.fieldValue = objectData.recordTypeInfos[this.recordTypeId].name;
                            }         
                            else if (column.isField) {
                                // Column is a normal field - retrieve from objectInfo
                                column.fieldName = fieldDef.apiName;
                                column.fieldLabel = column.fieldLabel ? column.fieldLabel : fieldDef.label;
                            }

                            // Determine if the field is editable or not
                            // If at least one field in the section is editable,
                            // Allow the user to access the edit mode of the form
                            if (layoutItem.editableForUpdate && layoutComponent.componentType === "Field" && !column.fieldValue) {
                                // This field is editable
                                section.editable ++;
                                column.editable = true;
                                column.readOnly = false;
                                column.disabled = false;
                                column.required = layoutItem.required;
                            } 
                            else if (layoutComponent.componentType === "Field") {
                                column.editable = false;
                                // This field is not editable; determine if Read-Only or Disabled
                                // Read-only does not work for Text Area, Picklist/MultiPicklist, or Lookups
                                // If one of these types, disable the field; else make read-only
                                let fieldType = fieldDef.dataType;
                                if (fieldType === "Picklist" || fieldType === "Reference" || 
                                        fieldType === "TextArea" || fieldType === "MultiPicklist") {
                                    // Field is Disabled
                                    column.disabled = true;
                                    column.readOnly = false;
                                }
                                else {
                                    // Field is Read-only
                                    column.readOnly = true;
                                    column.disabled = false;
                                }
                            }

                            // Push the column to the row
                            row.columns.push(column);
                        }
                    }
                    // Push the row to the section
                    section.rows.push(row);
                }
                // Once the requested section is found, no need to get the rest
                break;
            }
        }
        // Only display the component if the requested info is found
        this.sectionInfo = section.title ? section : {}; 
    }

    /****************************** INTERACTION METHODS *********************************/

    get displaySection() {
        return (this.sectionInfo && this.recordTypeId) ? true : false;
    }
    
    toggleSpinner() {
        // Turn the spinner on/off
        this.displaySpinner = !this.displaySpinner;
    }
    
    toggleEditMode() {
        // Switch between the edit and view forms
        if (this.editMode || (!this.editMode && this.sectionInfo.editable)) {
            // Clear the error object - to prevent validation errors from "persisting"
            // Use case: from edit screen, trigger validation => Click cancel => Click edit
            // Unless handled, the error message will still display
            this.error = {};
            // Toggle back to the other mode
            this.editMode = !this.editMode;
        }
    }

    
    handleSubmit() {
        // Handles lightning-record-edit-form onsubmit event
        // Clear the error and turn on the spinner
        this.error = {};
        this.toggleSpinner();
    }
    
    handleError(event) {
        // Handles lightning-record-edit-form onerror event
        // Clear the error object to prevent mixed messages
        this.error = {};
        // Pass onerror event to <c-page-layout-errors>
        this.error = event;
        this.toggleSpinner();
    }

    handleSuccess() {
        // Handles lightning-record-edit-form onsuccess event
        this.toggleEditMode();
        const event = new ShowToastEvent({
            title: 'Success!',
            variant: 'success'
        });
        this.dispatchEvent(event);
        this.toggleSpinner();
    }
}