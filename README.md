# BetterPageLayout
A bundle of components that allow you quickly create paginated page layouts in Lightning Experience. This makes for less vertical scrolling and quicker page load times.

![](mainDemo.gif)

These components make heavy use of the ```getRecordUi``` wire method, which returns an object containing layout, object, and record-level data for a given recordId.

## Components
#### Main Components:
- ```<c-page-layout-section>``` base component. Uses ```getRecordUi``` to replicate the page layout as defined in Salesforce's Setup UI.
-   ```<c-page-layout-section-card>``` wraps the base component in a ```<lightning-card>``` and displays a single page layout section specified in the Lightning App Builder. Admins are able to specify a header style to fit their desired purpose.
![](cardHeader.gif)

- ```<c-page-layout-accordion>``` displays the entire page layout in wrapped in a ```<lightning-accordion>```. Because the entire layout is not rendered at once, this is more performant than the standard "Record Detail" component. 
![](accordionDemo.gif)

- ```<c-page-layout-tabs>``` displays the entire page layout in wrapped in a ```<lightning-tabset>```. Because the entire layout is not rendered at once, this is more performant than the standard "Record Detail" component. 
![](tabDemo.gif)

- ```<c-better-page-layout>``` combines the power of ```<c-page-layout-accordion>``` and ```<c-page-layout-tabs>```. Admins can toggle between either implementation in the flexipage.
![](tabAccordion.gif)

#### Utility Components: 
-   ```<c-object-icon>``` displays the object icon of the given recordId. This supports standard and custom objects, as long as they have ```themeInfo``` (which includes tab color & icon) defined. If they do not, the component will display the default wrench icon assigned by Salesforce to objects without ```themeInfo```.

-   ```<c-page-layout-errors>``` designed to build on the ```<lightning-messages>``` base component. The original component must be a direct descendant of ```<c-lightning-page-edit-form>```, and its styling is somewhat awkward. The new component parses the onerror event generated from ```<c-lightning-page-edit-form>```. In addition to being a little more subtle, this component does not need to be a direct descendant.
![](errorDemo.gif)

## Current Limitations:
-   Does not currently support editing fields that are not natively supported by   ```<lightning-input-field>```. Currently, this includes ```OwnerId``` and ```RecordTypeId```. If included on the layout, these fields will be read-only/disabled.
-   Does not support elements common in Classic UI, such as report charts, custom links, and visualforce embeds. Fields and empty spaces are the only supported elements. Unsupported elements will render as an empty space. Sections that contain these elements will still be included in ```<c-better-page-layout>``` as long as they contain at least one field. If a section does not contain a single field, it will not render.
-   The base component ```<c-page-layout-section>``` renders the first page layout section with a header that matches ```sectionName```. Because of this, attempts to load a page layout with multiple sections with the same name will only yield the first section multiple times.
-   For the same reason, the ```sectionName``` input (as seen externally in the flexipage on ```<c-page-layout-section-card>```) is case-sensitive. "Main Section" will return a result, but "main section" will not. If the desired ```sectionName``` cannot be found on the current layout, the component fail gracefully - nothing will be shown. 
-   Be conscious of your page layout assignments when using the single-section components (```<c-page-layout-section>``` & ```<c-page-layout-section-card>```) to create lightning pages. The ```getRecordUi``` wire method returns layout info based on the running user's assigned page layout, which can vary by the User's profile and Object's record type. If a user's assigned page layout does not have a section bearing the name defined in ```sectionName```, the component will show nothing. Additionally, the user may see something other than what was intended if their assigned page layout has a section with the same name as the admin has defined in ```sectionName```. For this reason, it's recommended that you use the Lightning App Builder's component visibility along with multiple iterations of the component to control for potential profile and record type discrepancies. Alternatively, consider using ```<c-better-page-layout>``` to get every page layout section, regardless of the assigned page layout.

## Potential Future Improvements:
-   Allow for ```sectionName``` to be case-insensitive
-   Revisit architecture; find another way to pull page layout information dynamically, without relying on the provided value for ```sectionName``` to resolve duplicate section issues
-   Add support for OwnerId and RecordTypeId fields, which are not currently supported natively by ```<lightning-input-field>```. Will require a new custom field component.
-   Create new subcomponents for record fields. Currently, ```<lightning-input-field>``` & ```<lightning-output-field>``` must be direct descendants of a ```<lightning-record-*-form>``` component in order to render. Much of the processing in this component is dedicated to parsing field values and handling special use cases (RecordType fields, compound fields, disabled vs. read-only fields, etc.), and it would be preferable to separate this functionality from the record layout component itself.
-   Support passing a related record Id to the component from the Lightning App Builder (i.e., get the Account layout on the Contact page by passing the Contact's AccountId field into the ```recordId``` input). 