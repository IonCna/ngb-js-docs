import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";

@Component({
    selector: "docs-popover-events",
    controllerAs: "example",
    templateUrl: "./popover-events.component.html",
    styleUrl: "./popover-events.component.css",
})
export class PopoverEventsComponent {
    public popover?: NgbPopover;
    public events: { name: string; time: Date }[] = [];
    public record(name: string) { this.events.unshift({ name, time: new Date() }); }
}
