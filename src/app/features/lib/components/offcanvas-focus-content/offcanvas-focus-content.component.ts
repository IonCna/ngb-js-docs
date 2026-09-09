import type { IComponentController, IComponentOptions } from "angular";
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";

export class OffcanvasFocusContentComponent implements IComponentController {
    public ngbActiveOffcanvas!: NgbActiveOffcanvas;
    public autofocus = false;

    static get $name() {
        return "docsOffcanvasFocusContent"
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                ngbActiveOffcanvas: "<",
                autofocus: "<?",
            },
            controller: OffcanvasFocusContentComponent,
            controllerAs: "$",
            templateUrl: "./offcanvas-focus-content.component.html", styleUrl: "./offcanvas-focus-content.component.css",
        }
    }
}
