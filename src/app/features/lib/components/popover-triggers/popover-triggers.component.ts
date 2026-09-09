import type { IComponentController, IComponentOptions } from "angular";
import type { NgbPopover } from "ngb-js/popover";

export class PopoverTriggersComponent implements IComponentController {
    public manual?: NgbPopover;
    static get $name() { return "docsPopoverTriggers" }
    static get $factory(): IComponentOptions {
        return { controller: PopoverTriggersComponent, controllerAs: "example", templateUrl: "./popover-triggers.component.html", styleUrl: "./popover-triggers.component.css" }
    }
}
