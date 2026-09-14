import { Component } from "ngjs-core";

@Component({
    selector: "docs-basic-pagination",
    controllerAs: "example",
    templateUrl: "./basic-pagination.component.html",
    styleUrl: "./basic-pagination.component.css",
})
export class BasicPaginationComponent {
    public page = 4;

    public selectPage(page: number) {
        this.page = page;
    }
}
