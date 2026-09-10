import { Component } from "ngjs-core";
import {type IAugmentedJQuery, type IComponentController, type IComponentOptions} from "angular";
import { NgbOffcanvasRef } from "ngb-js/offcanvas/compat"

type MenuModes = "desktop" | "mobile";

@Component({
    selector: "docs-menu",
    templateUrl: "./menu.component.html",
    styleUrl: "./menu.component.css",
    controllerAs: "$",
    bindings: {
        mode: "@",
        ngbActiveOffcanvas: "<?",
    },
})
export class MenuComponent implements IComponentController {
    public mode: MenuModes = "desktop";
    public ngbActiveOffcanvas?: NgbOffcanvasRef;

    constructor(private $element: IAugmentedJQuery) {}

    $postLink() {
        if (this.mode === "mobile") {
            this.$element.addClass("h-100 d-flex flex-column");
        }
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                mode: "@",
                ngbActiveOffcanvas: "<?",
            },
            controllerAs: "$",
            controller: MenuComponent,
            templateUrl: "./menu.component.html", styleUrl: "./menu.component.css",
        }
    }

    static get $inject() {
        return ["$element"]
    }

    static get $name() {
        return "docsMenu";
    }
}
