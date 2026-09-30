import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-autoclose",
    controllerAs: "example",
    templateUrl: "./popover-autoclose.component.html",
    styleUrl: "./popover-autoclose.component.css",
})
export class PopoverAutocloseComponent {
    public popover?: NgbPopover;
}
