import { LightningElement, api, wire } from 'lwc';
import { getRecordUi } from 'lightning/uiRecordApi';

export default class ObjectIcon extends LightningElement {
    @api recordId;      // Needed to run the wire
    @api objectApiName; // Needed to run the wire
    @api iconSize;      // Alters the size of the icon via slds-avatar_*. 
                        // - Accepted values: x-small, small, medium, large
                        // - For more info, visit https://www.lightningdesignsystem.com/components/avatar/#Sizes
    iconUrl;            // Set by the wire; the icon to display
    iconColor;          // Set by the wire; the icon's raw color value 

    @wire(getRecordUi, { recordIds: '$recordId', layoutTypes: 'Full', modes: 'View' })
    response ({ error, data }) {
        if (data) {
            let themeInfo = data.objectInfos[this.objectApiName].themeInfo || {};
            if (themeInfo) {
                this.iconUrl = themeInfo.iconUrl || {};
                this.iconColor = themeInfo.color || {};
            }
        }
    }

    get backgroundColor() {
        // Dynamically set the background-color of the icon div
        // Can't do this by using the existing themeInfo object
        let color = "background-color: " + (this.iconColor ? ("#" + this.iconColor) : "") + ";";
        return color;
    }

    get iconStyle() {
        // Use in tandem with this.iconSize to dynamically set the size of the icon
        let style = "slds-avatar slds-media__figure slds-listbox__option-icon slds-m-top_none";
        style = (this.iconSize && (this.iconSize === "x-small" || this.iconSize === "medium" || this.iconSize === "large")) ? 
                    (style + " slds-avatar_" + this.iconSize) : 
                    (style + " slds-avatar_small");
        return style;
    }
}