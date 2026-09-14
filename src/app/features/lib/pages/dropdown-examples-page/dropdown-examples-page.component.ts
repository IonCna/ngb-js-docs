import { Component } from "ngjs-core";
import dropdownDisabledItemsTs from "@/features/lib/components/dropdown-disabled-items/dropdown-disabled-items.component.ts?raw"
import dropdownFormTs from "@/features/lib/components/dropdown-form/dropdown-form.component.ts?raw"
import dropdownGlobalTs from "@/features/lib/components/dropdown-global/dropdown-global.component.ts?raw"
import manualDropdownTs from "@/features/lib/components/manual-dropdown/manual-dropdown.component.ts?raw"
import simpleDropdownHtml from "@/features/lib/components/simple-dropdown/simple-dropdown.component.html?raw"
import manualDropdownHtml from "@/features/lib/components/manual-dropdown/manual-dropdown.component.html?raw"
import dropdownButtonGroupsHtml from "@/features/lib/components/dropdown-button-groups/dropdown-button-groups.component.html?raw"
import dropdownDisabledItemsHtml from "@/features/lib/components/dropdown-disabled-items/dropdown-disabled-items.component.html?raw"
import dropdownFormHtml from "@/features/lib/components/dropdown-form/dropdown-form.component.html?raw"
import dropdownBodyHtml from "@/features/lib/components/dropdown-body/dropdown-body.component.html?raw"
import dropdownNavbarHtml from "@/features/lib/components/dropdown-navbar/dropdown-navbar.component.html?raw"
import dropdownGlobalHtml from "@/features/lib/components/dropdown-global/dropdown-global.component.html?raw"

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
