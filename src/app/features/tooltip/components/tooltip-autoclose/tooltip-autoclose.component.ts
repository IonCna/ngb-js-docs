import { Component, type TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-tooltip-autoclose",
    controllerAs: "example",
    templateUrl: "./tooltip-autoclose.component.html",
    styleUrl: "./tooltip-autoclose.component.css",
})
export class TooltipAutocloseComponent {
    public contentTemplate?: TemplateRef<unknown>;
}
