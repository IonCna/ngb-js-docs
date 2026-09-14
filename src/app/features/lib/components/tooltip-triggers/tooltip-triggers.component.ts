import { Component } from "ngjs-core";
import type { NgbTooltip } from "ngb-js/tooltip";

@Component({
    selector: "docs-tooltip-triggers",
    controllerAs: "example",
    templateUrl: "./tooltip-triggers.component.html",
    styleUrl: "./tooltip-triggers.component.css",
})
export class TooltipTriggersComponent {
    public manual?: NgbTooltip;
}
