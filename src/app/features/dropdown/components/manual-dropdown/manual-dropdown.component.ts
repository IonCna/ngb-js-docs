import { Component, ViewChild } from "ngjs-core";
import { NgbDropdown } from "ngb-js/dropdown/compat";

@Component({
    selector: "docs-manual-dropdown",
    controllerAs: "example",
    templateUrl: "./manual-dropdown.component.html",
    styleUrl: "./manual-dropdown.component.css",
})
export class ManualDropdownComponent {
    @ViewChild("dropdown", { static: true })
    private dropdown!: NgbDropdown;

    public opened = false;

    public open() {
        this.dropdown.open();
    }

    public close() {
        this.dropdown.close();
    }

    public toggle() {
        this.dropdown.toggle();
    }
}
