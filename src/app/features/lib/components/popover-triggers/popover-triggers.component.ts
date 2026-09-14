import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-triggers",
    controllerAs: "example",
    templateUrl: "./popover-triggers.component.html",
    styleUrl: "./popover-triggers.component.css",
})
export class PopoverTriggersComponent {
    public manual?: NgbPopover;
}
