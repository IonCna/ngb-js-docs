import type { IComponentController, IComponentOptions } from "angular";
import type { NgbPopover } from "ngb-js/popover";
import type { TemplateRef } from "ngjs-core";

export class PopoverContextComponent implements IComponentController {
    public name = "World";
    public contentTemplate?: TemplateRef<unknown>;
    public titleTemplate?: TemplateRef<unknown>;
    public french?: NgbPopover;
    public german?: NgbPopover;
    public english?: NgbPopover;

    public toggleWithGreeting(popover: NgbPopover, greeting: string, language: string) {
        popover.isOpen() ? popover.close() : popover.open({ greeting, language });
    }

    static get $name() { return "docsPopoverContext" }
    static get $factory(): IComponentOptions {
        return { controller: PopoverContextComponent, controllerAs: "example", templateUrl: "./popover-context.component.html", styleUrl: "./popover-context.component.css" }
    }
}
