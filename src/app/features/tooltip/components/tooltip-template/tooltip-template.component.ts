import { Component, type TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-tooltip-template",
    controllerAs: "example",
    templateUrl: "./tooltip-template.component.html",
    styleUrl: "./tooltip-template.component.css",
})
export class TooltipTemplateComponent {
    public name = "NgbJS";
    public contentTemplate?: TemplateRef<unknown>;
}
