import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbPaginationConfig, NGB_PAGINATION_CONFIG } from "ngb-js/pagination";

@Component({
    selector: "docs-pagination-global",
    controllerAs: "example",
    templateUrl: "./pagination-global.component.html",
    styleUrl: "./pagination-global.component.css",
})
export class PaginationGlobalComponent implements AfterViewInit, OnDestroy {
    public page = 8;

    private readonly initialConfig: Pick<
        NgbPaginationConfig,
        "boundaryLinks" | "directionLinks" | "maxSize" | "rotate" | "size"
    >;

    constructor(@Inject(NGB_PAGINATION_CONFIG) private readonly config: NgbPaginationConfig) {
        this.initialConfig = {
            boundaryLinks: config.boundaryLinks,
            directionLinks: config.directionLinks,
            maxSize: config.maxSize,
            rotate: config.rotate,
            size: config.size,
        };

        config.boundaryLinks = true;
        config.directionLinks = false;
        config.maxSize = 5;
        config.rotate = true;
        config.size = "sm";
    }

    public selectPage(page: number) {
        this.page = page;
    }

    public ngAfterViewInit() {
        this.restoreConfig();
    }

    public ngOnDestroy() {
        this.restoreConfig();
    }

    private restoreConfig() {
        this.config.boundaryLinks = this.initialConfig.boundaryLinks;
        this.config.directionLinks = this.initialConfig.directionLinks;
        this.config.maxSize = this.initialConfig.maxSize;
        this.config.rotate = this.initialConfig.rotate;
        this.config.size = this.initialConfig.size;
    }
}
