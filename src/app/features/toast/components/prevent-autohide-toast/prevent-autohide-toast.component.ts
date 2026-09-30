import { Component } from "ngjs-core";

@Component({
    selector: "docs-prevent-autohide-toast",
    controllerAs: "example",
    templateUrl: "./prevent-autohide-toast.component.html",
    styleUrl: "./prevent-autohide-toast.component.css",
})
export class PreventAutohideToastComponent {
    public visible = false;
    public autohide = true;

    public show(): void {
        this.visible = false;
        this.autohide = true;
        setTimeout(() => this.visible = true);
    }

    public hide(): void {
        this.visible = false;
        this.autohide = true;
    }
}
