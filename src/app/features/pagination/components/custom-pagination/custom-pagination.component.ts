import { Component } from "ngjs-core";

@Component({
    selector: "docs-custom-pagination",
    controllerAs: "example",
    templateUrl: "./custom-pagination.component.html",
    styleUrl: "./custom-pagination.component.css",
})
export class CustomPaginationComponent {
    public page = 3;

    public selectPage(page: number) {
        this.page = page;
    }
}
