import { Component } from "ngjs-core";

@Component({
    selector: "docs-pagination-size",
    controllerAs: "example",
    templateUrl: "./pagination-size.component.html",
    styleUrl: "./pagination-size.component.css",
})
export class PaginationSizeComponent {
    public smallPage = 2;
    public defaultPage = 2;
    public largePage = 2;

    public selectSmallPage(page: number) { this.smallPage = page; }
    public selectDefaultPage(page: number) { this.defaultPage = page; }
    public selectLargePage(page: number) { this.largePage = page; }
}
