import { Component, Input } from "ngjs-core";
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-demo-content",
    controllerAs: "$",
    templateUrl: "./offcanvas-demo-content.component.html",
    styleUrl: "./offcanvas-demo-content.component.css",
})
export class OffcanvasDemoContentComponent {
    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;
}
