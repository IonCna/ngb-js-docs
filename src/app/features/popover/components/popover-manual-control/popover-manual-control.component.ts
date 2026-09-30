import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-manual-control",
    controllerAs: "example",
    templateUrl: "./popover-manual-control.component.html",
    styleUrl: "./popover-manual-control.component.css",
})
export class PopoverManualControlComponent {
    public popover?: NgbPopover;
}
