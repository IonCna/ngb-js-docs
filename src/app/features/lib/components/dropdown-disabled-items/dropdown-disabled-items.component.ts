import { Component } from "ngjs-core";

@Component({
    selector: "docs-dropdown-disabled-items",
    controllerAs: "example",
    templateUrl: "./dropdown-disabled-items.component.html",
    styleUrl: "./dropdown-disabled-items.component.css",
})
export class DropdownDisabledItemsComponent {
    public restricted = true;
}
