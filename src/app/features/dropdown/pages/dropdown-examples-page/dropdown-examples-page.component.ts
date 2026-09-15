import { Component } from "ngjs-core";
import dropdownDisabledItemsTs from "@/features/dropdown/components/dropdown-disabled-items/dropdown-disabled-items.component.ts?raw"
import dropdownFormTs from "@/features/dropdown/components/dropdown-form/dropdown-form.component.ts?raw"
import dropdownGlobalTs from "@/features/dropdown/components/dropdown-global/dropdown-global.component.ts?raw"
import manualDropdownTs from "@/features/dropdown/components/manual-dropdown/manual-dropdown.component.ts?raw"
import simpleDropdownHtml from "@/features/dropdown/components/simple-dropdown/simple-dropdown.component.html?raw"
import manualDropdownHtml from "@/features/dropdown/components/manual-dropdown/manual-dropdown.component.html?raw"
import dropdownButtonGroupsHtml from "@/features/dropdown/components/dropdown-button-groups/dropdown-button-groups.component.html?raw"
import dropdownDisabledItemsHtml from "@/features/dropdown/components/dropdown-disabled-items/dropdown-disabled-items.component.html?raw"
import dropdownFormHtml from "@/features/dropdown/components/dropdown-form/dropdown-form.component.html?raw"
import dropdownBodyHtml from "@/features/dropdown/components/dropdown-body/dropdown-body.component.html?raw"
import dropdownNavbarHtml from "@/features/dropdown/components/dropdown-navbar/dropdown-navbar.component.html?raw"
import dropdownGlobalHtml from "@/features/dropdown/components/dropdown-global/dropdown-global.component.html?raw"

@Component({
    selector: "docs-dropdown-examples-page",
    controllerAs: "$",
    templateUrl: "./dropdown-examples-page.component.html",
    styleUrl: "./dropdown-examples-page.component.css",
})
export class DropdownExamplesPageComponent {
    public readonly examples = {
        simple: {
            html: simpleDropdownHtml,
        },
        manual: {
            html: manualDropdownHtml,
            typescript: manualDropdownTs,
        },
        buttonGroups: {
            html: dropdownButtonGroupsHtml,
        },
        disabledItems: {
            html: dropdownDisabledItemsHtml,
            typescript: dropdownDisabledItemsTs,
        },
        form: {
            html: dropdownFormHtml,
            typescript: dropdownFormTs,
        },
        body: {
            html: dropdownBodyHtml,
        },
        navbar: {
            html: dropdownNavbarHtml,
        },
        global: {
            html: dropdownGlobalHtml,
            typescript: dropdownGlobalTs,
        },
    }
}
