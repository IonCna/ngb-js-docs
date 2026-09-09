import type { IComponentController, IComponentOptions } from "angular";
import type { NgbTooltip } from "ngb-js/tooltip";

export class TooltipTriggersComponent implements IComponentController {
    public manual?: NgbTooltip;
    static get $name() { return "docsTooltipTriggers" }
    static get $factory(): IComponentOptions {
        return { controller: TooltipTriggersComponent, controllerAs: "example", templateUrl: "./tooltip-triggers.component.html", styleUrl: "./tooltip-triggers.component.css" }
    }
}
