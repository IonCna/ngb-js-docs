import { Component } from "ngjs-core";

@Component({
    selector: "docs-advanced-pagination",
    controllerAs: "example",
    templateUrl: "./advanced-pagination.component.html",
    styleUrl: "./advanced-pagination.component.css",
})
export class AdvancedPaginationComponent {
    public paginatedPage = 7;
    public rotatedPage = 12;
    public compactPage = 12;

    public selectPaginatedPage(page: number) { this.paginatedPage = page; }
    public selectRotatedPage(page: number) { this.rotatedPage = page; }
    public selectCompactPage(page: number) { this.compactPage = page; }
}
