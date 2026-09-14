import type { INgbCollapse } from "ngb-js/collapse";
import { Component, ViewChild } from "ngjs-core";

@Component({
    selector: "docs-simple-collapse",
    controllerAs: "example",
    templateUrl: "./simple-collapse.component.html",
    styleUrl: "./simple-collapse.component.css",
})
export class SimpleCollapseComponent {
    @ViewChild("collapse", { static: true })
    private collapse!: INgbCollapse;

    public collapsed = true;

    public toggleWithController() {
        this.collapse.toggle();
    }

    public toggleWithBinding() {
        this.collapsed = !this.collapsed;
    }
}
