import type { IComponentController, IComponentOptions } from "angular";
import { NgbDropdown } from "ngb-js/dropdown/compat";
import { ViewChild } from "ngjs-core";

export class ManualDropdownComponent implements IComponentController {
    @ViewChild("dropdown", { read: NgbDropdown, static: true })
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

    static get $name() {
        return "docsManualDropdown"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: ManualDropdownComponent,
            controllerAs: "example",
            templateUrl: "./manual-dropdown.component.html", styleUrl: "./manual-dropdown.component.css",
        }
    }
}
