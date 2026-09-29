import { Component } from "ngjs-core";

@Component({
    selector: "docs-template-header-toast",
    controllerAs: "example",
    templateUrl: "./template-header-toast.component.html",
    styleUrl: "./template-header-toast.component.css",
})
export class TemplateHeaderToastComponent {
    public visible = true;
}
