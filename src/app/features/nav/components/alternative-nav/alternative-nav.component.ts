import { Component } from "ngjs-core";

@Component({
    selector: "docs-alternative-nav",
    controllerAs: "example",
    templateUrl: "./alternative-nav.component.html",
    styleUrl: "./alternative-nav.component.css",
})
export class AlternativeNavComponent {
    public activeId = "alternative-home";
}
