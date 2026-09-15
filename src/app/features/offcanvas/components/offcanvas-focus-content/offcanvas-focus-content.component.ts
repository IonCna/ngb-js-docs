import { Component, Input } from "ngjs-core";
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-focus-content",
    controllerAs: "$",
    templateUrl: "./offcanvas-focus-content.component.html",
    styleUrl: "./offcanvas-focus-content.component.css",
})
export class OffcanvasFocusContentComponent {
    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;
    @Input() autofocus = false;
}
