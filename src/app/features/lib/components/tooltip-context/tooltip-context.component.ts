import type { IComponentController, IComponentOptions } from "angular";
import type { NgbTooltip } from "ngb-js/tooltip";
import type { TemplateRef } from "ngjs-core";

export class TooltipContextComponent implements IComponentController {
    public name = "World";
    public contentTemplate?: TemplateRef<unknown>;
    public french?: NgbTooltip;
    public german?: NgbTooltip;
    public english?: NgbTooltip;

    public toggleWithGreeting(tooltip: NgbTooltip, greeting: string): void {
        tooltip.isOpen() ? tooltip.close() : tooltip.open({ greeting });
    }

    static get $name() { return "docsTooltipContext" }
    static get $factory(): IComponentOptions {
        return { controller: TooltipContextComponent, controllerAs: "example", templateUrl: "./tooltip-context.component.html", styleUrl: "./tooltip-context.component.css" }
    }
}
