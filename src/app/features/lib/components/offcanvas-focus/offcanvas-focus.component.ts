import { Component, Inject } from "ngjs-core";
import { OffcanvasFocusContentComponent } from "@/features/lib/components/offcanvas-focus-content/offcanvas-focus-content.component"
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-focus",
    controllerAs: "example",
    templateUrl: "./offcanvas-focus.component.html",
    styleUrl: "./offcanvas-focus.component.css",
})
export class OffcanvasFocusComponent {
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}

    public openDefaultFocus() {
        this.offcanvas.open(OffcanvasFocusContentComponent, {
            ariaLabelledBy: "offcanvas-focus-title",
            bindings: { autofocus: false },
        });
    }

    public openCustomFocus() {
        this.offcanvas.open(OffcanvasFocusContentComponent, {
            ariaLabelledBy: "offcanvas-focus-title",
            bindings: { autofocus: true },
        });
    }
}
