import type { IComponentController, IComponentOptions } from "angular";
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";
import { TemplateRef, ViewChild } from "ngjs-core";

export class OffcanvasDefaultComponent implements IComponentController {
    @ViewChild("content", { read: TemplateRef, static: true })
    private content!: TemplateRef<unknown>;

    constructor(private readonly offcanvas: NgbOffcanvas) {}

    public open() {
        this.offcanvas.open(this.content);
    }

    static get $name() {
        return "docsOffcanvasDefault"
    }

    static get $inject() {
        return [NGB_OFFCANVAS]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: OffcanvasDefaultComponent,
            controllerAs: "example",
            templateUrl: "./offcanvas-default.component.html", styleUrl: "./offcanvas-default.component.css",
        }
    }
}
