import type { IComponentController, IComponentOptions } from "angular";
import { NgbPaginationConfig, NGB_PAGINATION_CONFIG } from "ngb-js/pagination";

export class PaginationGlobalComponent implements IComponentController {
    public page = 8;

    private readonly initialConfig: Pick<
        NgbPaginationConfig,
        "boundaryLinks" | "directionLinks" | "maxSize" | "rotate" | "size"
    >;

    constructor(private readonly config: NgbPaginationConfig) {
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

    public $postLink() {
        this.restoreConfig();
    }

    public $onDestroy() {
        this.restoreConfig();
    }

    private restoreConfig() {
        this.config.boundaryLinks = this.initialConfig.boundaryLinks;
        this.config.directionLinks = this.initialConfig.directionLinks;
        this.config.maxSize = this.initialConfig.maxSize;
        this.config.rotate = this.initialConfig.rotate;
        this.config.size = this.initialConfig.size;
    }

    static get $name() {
        return "docsPaginationGlobal"
    }

    static get $inject() {
        return [NGB_PAGINATION_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: PaginationGlobalComponent,
            controllerAs: "example",
            templateUrl: "./pagination-global.component.html", styleUrl: "./pagination-global.component.css",
        }
    }
}
