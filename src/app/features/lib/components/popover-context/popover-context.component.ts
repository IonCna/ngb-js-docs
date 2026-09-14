import { Component } from "ngjs-core";
import type { NgbPopover } from "ngb-js/popover";
import type { TemplateRef } from "ngjs-core";

@Component({
    selector: "docs-popover-context",
    controllerAs: "example",
    templateUrl: "./popover-context.component.html",
    styleUrl: "./popover-context.component.css",
})
export class PopoverContextComponent {
    public name = "World";
    public contentTemplate?: TemplateRef<unknown>;
    public titleTemplate?: TemplateRef<unknown>;
    public french?: NgbPopover;
    public german?: NgbPopover;
    public english?: NgbPopover;

    public toggleWithGreeting(popover: NgbPopover, greeting: string, language: string) {
        popover.isOpen() ? popover.close() : popover.open({ greeting, language });
    }
}
