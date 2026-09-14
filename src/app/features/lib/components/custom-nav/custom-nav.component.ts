import { Component } from "ngjs-core";

@Component({
    selector: "docs-custom-nav",
    controllerAs: "example",
    templateUrl: "./custom-nav.component.html",
    styleUrl: "./custom-nav.component.css",
})
export class CustomNavComponent {
    public activeId = "custom-weekly";
}
