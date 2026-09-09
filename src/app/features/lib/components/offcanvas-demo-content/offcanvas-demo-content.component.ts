import type { IComponentController, IComponentOptions } from "angular";
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";

export class OffcanvasDemoContentComponent implements IComponentController {
    public ngbActiveOffcanvas!: NgbActiveOffcanvas;

    static get $name() {
        return "docsOffcanvasDemoContent"
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                ngbActiveOffcanvas: "<",
            },
            controller: OffcanvasDemoContentComponent,
            controllerAs: "$",
            templateUrl: "./offcanvas-demo-content.component.html", styleUrl: "./offcanvas-demo-content.component.css",
        }
    }
}
