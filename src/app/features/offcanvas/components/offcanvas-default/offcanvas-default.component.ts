import { Component, Inject, TemplateRef, ViewChild } from "ngjs-core";
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-default",
    controllerAs: "example",
    templateUrl: "./offcanvas-default.component.html",
    styleUrl: "./offcanvas-default.component.css",
})
export class OffcanvasDefaultComponent {
    @ViewChild("content", { read: TemplateRef, static: true })
    private content!: TemplateRef<unknown>;

    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}

    public open() {
        this.offcanvas.open(this.content);
    }
}
