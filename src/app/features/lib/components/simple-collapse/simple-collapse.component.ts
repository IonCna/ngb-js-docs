import type { IComponentController, IComponentOptions } from "angular";
import type { INgbCollapse } from "ngb-js/collapse";
import { ViewChild } from "ngjs-core";

export class SimpleCollapseComponent implements IComponentController {
    @ViewChild("collapse", { static: true })
    private collapse!: INgbCollapse;

    public collapsed = true;

    public toggleWithController() {
        this.collapse.toggle();
    }

    public toggleWithBinding() {
        this.collapsed = !this.collapsed;
    }

    static get $name() {
        return "docsSimpleCollapse"
    }

    static get $factory(): IComponentOptions {
        return {
            controller: SimpleCollapseComponent,
            controllerAs: "example",
            templateUrl: "./simple-collapse.component.html", styleUrl: "./simple-collapse.component.css",
        }
    }
}
