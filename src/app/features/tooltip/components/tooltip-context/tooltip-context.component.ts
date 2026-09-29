import { Component, type TemplateRef } from "ngjs-core";
import type { NgbTooltip } from "ngb-js/tooltip";

@Component({
    selector: "docs-tooltip-context",
    controllerAs: "example",
    templateUrl: "./tooltip-context.component.html",
    styleUrl: "./tooltip-context.component.css",
})
export class TooltipContextComponent {
    public name = "World";
    public contentTemplate?: TemplateRef<unknown>;
    public french?: NgbTooltip;
    public german?: NgbTooltip;
    public english?: NgbTooltip;

    public toggleWithGreeting(tooltip: NgbTooltip, greeting: string): void {
        tooltip.isOpen() ? tooltip.close() : tooltip.open({ greeting });
    }
}
