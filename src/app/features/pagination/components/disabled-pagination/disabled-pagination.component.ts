import { Component } from "ngjs-core";

@Component({
    selector: "docs-disabled-pagination",
    controllerAs: "example",
    templateUrl: "./disabled-pagination.component.html",
    styleUrl: "./disabled-pagination.component.css",
})
export class DisabledPaginationComponent {
    public page = 3;
    public disabled = true;

    public selectPage(page: number) {
        this.page = page;
    }
}
