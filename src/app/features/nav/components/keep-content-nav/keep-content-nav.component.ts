import { Component } from "ngjs-core";

@Component({
    selector: "docs-keep-content-nav",
    controllerAs: "example",
    templateUrl: "./keep-content-nav.component.html",
    styleUrl: "./keep-content-nav.component.css",
})
export class KeepContentNavComponent {
    public activeId = "keep-editor";
    public draft = "This value survives tab changes.";
}
