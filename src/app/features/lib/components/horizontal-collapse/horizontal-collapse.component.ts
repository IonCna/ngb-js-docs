import { Component } from "ngjs-core";

@Component({
    selector: "docs-horizontal-collapse",
    controllerAs: "example",
    templateUrl: "./horizontal-collapse.component.html",
    styleUrl: "./horizontal-collapse.component.css",
})
export class HorizontalCollapseComponent {
    public collapsed = true;

    public toggle() {
        this.collapsed = !this.collapsed;
    }
}
