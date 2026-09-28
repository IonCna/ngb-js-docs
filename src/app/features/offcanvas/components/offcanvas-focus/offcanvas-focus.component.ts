import { Component } from "ngjs-core";
import { OffcanvasFocusContentComponent } from "@/features/offcanvas/components/offcanvas-focus-content/offcanvas-focus-content.component"
import { NgbOffcanvas } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-focus",
    controllerAs: "example",
    templateUrl: "./offcanvas-focus.component.html",
    styleUrl: "./offcanvas-focus.component.css",
})
export class OffcanvasFocusComponent {
    constructor(private readonly offcanvas: NgbOffcanvas) {}

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
