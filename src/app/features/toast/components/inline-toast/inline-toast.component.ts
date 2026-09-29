import { Component } from "ngjs-core";

@Component({
    selector: "docs-inline-toast",
    controllerAs: "example",
    templateUrl: "./inline-toast.component.html",
    styleUrl: "./inline-toast.component.css",
})
export class InlineToastComponent {
    public showHeaderToast = true;
}
