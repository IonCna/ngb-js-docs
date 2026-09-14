import { Component } from "ngjs-core";

@Component({
    selector: "docs-dropdown-form",
    controllerAs: "example",
    templateUrl: "./dropdown-form.component.html",
    styleUrl: "./dropdown-form.component.css",
})
export class DropdownFormComponent {
    public email = "";
    public remember = false;
    public submitted = false;

    public submit() {
        this.submitted = true;
    }
}
