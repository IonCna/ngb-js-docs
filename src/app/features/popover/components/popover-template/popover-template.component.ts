import { Component } from "ngjs-core";
import type { TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-popover-template",
    controllerAs: "example",
    templateUrl: "./popover-template.component.html",
    styleUrl: "./popover-template.component.css",
})
export class PopoverTemplateComponent {
    public name = "NgbJS";
    public contentTemplate?: TemplateRef<unknown>;
    public titleTemplate?: TemplateRef<unknown>;
}
