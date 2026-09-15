import { Component } from "ngjs-core";

@Component({
    selector: "docs-pagination-alignment",
    controllerAs: "example",
    templateUrl: "./pagination-alignment.component.html",
    styleUrl: "./pagination-alignment.component.css",
})
export class PaginationAlignmentComponent {
    public startPage = 2;
    public centerPage = 2;
    public endPage = 2;

    public selectStartPage(page: number) { this.startPage = page; }
    public selectCenterPage(page: number) { this.centerPage = page; }
    public selectEndPage(page: number) { this.endPage = page; }
}
