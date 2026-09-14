import { Component } from "ngjs-core";

@Component({
    selector: "docs-vertical-nav",
    controllerAs: "example",
    templateUrl: "./vertical-nav.component.html",
    styleUrl: "./vertical-nav.component.css",
})
export class VerticalNavComponent {
    public activeId = "vertical-profile";
}
