import type { IComponentController, IComponentOptions } from "angular";
import type { NgbPopover } from "ngb-js/popover";

export class PopoverManualControlComponent implements IComponentController {
    public popover?: NgbPopover;
    static get $name() { return "docsPopoverManualControl" }
    static get $factory(): IComponentOptions {
        return { controller: PopoverManualControlComponent, controllerAs: "example", templateUrl: "./popover-manual-control.component.html", styleUrl: "./popover-manual-control.component.css" }
    }
}
