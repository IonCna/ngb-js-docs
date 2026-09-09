import type { IComponentController, IComponentOptions } from "angular";
import { OffcanvasFocusContentComponent } from "@/features/lib/components/offcanvas-focus-content/offcanvas-focus-content.component"
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";

export class OffcanvasFocusComponent implements IComponentController {
    constructor(private readonly offcanvas: NgbOffcanvas) {}

    public openDefaultFocus() {
        this.offcanvas.open(OffcanvasFocusContentComponent.$name, {
            ariaLabelledBy: "offcanvas-focus-title",
            bindings: { autofocus: false },
        });
    }

    public openCustomFocus() {
        this.offcanvas.open(OffcanvasFocusContentComponent.$name, {
            ariaLabelledBy: "offcanvas-focus-title",
            bindings: { autofocus: true },
        });
    }

    static get $name() {
        return "docsOffcanvasFocus"
    }

    static get $inject() {
        return [NGB_OFFCANVAS]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: OffcanvasFocusComponent,
            controllerAs: "example",
            templateUrl: "./offcanvas-focus.component.html", styleUrl: "./offcanvas-focus.component.css",
        }
    }
}
