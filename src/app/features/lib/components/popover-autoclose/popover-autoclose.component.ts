import type { IComponentController, IComponentOptions } from "angular";
import type { NgbPopover } from "ngb-js/popover";

export class PopoverAutocloseComponent implements IComponentController {
    public popover?: NgbPopover;
    static get $name() { return "docsPopoverAutoclose" }
    static get $factory(): IComponentOptions {
        return { controller: PopoverAutocloseComponent, controllerAs: "example", templateUrl: "./popover-autoclose.component.html", styleUrl: "./popover-autoclose.component.css" }
    }
}
