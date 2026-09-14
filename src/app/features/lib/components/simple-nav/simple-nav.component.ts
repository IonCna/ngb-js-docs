import { Component } from "ngjs-core";

@Component({
    selector: "docs-simple-nav",
    controllerAs: "example",
    templateUrl: "./simple-nav.component.html",
    styleUrl: "./simple-nav.component.css",
})
export class SimpleNavComponent {
    public activeId = "simple-overview";
}
