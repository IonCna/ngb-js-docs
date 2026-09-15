import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`<div class="vstack gap-4">\r
    <div>\r
        <p class="small fw-semibold mb-2">Restricted page range</p>\r
        <ngb-pagination\r
            collection-size="120"\r
            page="example.paginatedPage"\r
            page-change="example.selectPaginatedPage($event)"\r
            max-size="5"\r
            boundary-links="true">\r
        </ngb-pagination>\r
    </div>\r
\r
    <div>\r
        <p class="small fw-semibold mb-2">Rotating page range</p>\r
        <ngb-pagination\r
            collection-size="240"\r
            page="example.rotatedPage"\r
            page-change="example.selectRotatedPage($event)"\r
            max-size="5"\r
            rotate="true"\r
            boundary-links="true">\r
        </ngb-pagination>\r
    </div>\r
\r
    <div>\r
        <p class="small fw-semibold mb-2">Without ellipses</p>\r
        <ngb-pagination\r
            collection-size="240"\r
            page="example.compactPage"\r
            page-change="example.selectCompactPage($event)"\r
            max-size="5"\r
            rotate="true"\r
            ellipses="false">\r
        </ngb-pagination>\r
    </div>\r
</div>\r
`,r=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-advanced-pagination",\r
    controllerAs: "example",\r
    templateUrl: "./advanced-pagination.component.html",\r
    styleUrl: "./advanced-pagination.component.css",\r
})\r
export class AdvancedPaginationComponent {\r
    public paginatedPage = 7;\r
    public rotatedPage = 12;\r
    public compactPage = 12;\r
\r
    public selectPaginatedPage(page: number) { this.paginatedPage = page; }\r
    public selectRotatedPage(page: number) { this.rotatedPage = page; }\r
    public selectCompactPage(page: number) { this.compactPage = page; }\r
}\r
`,i=`<ngb-pagination\r
    collection-size="70"\r
    page="example.page"\r
    page-change="example.selectPage($event)">\r
</ngb-pagination>\r
\r
<p class="small text-body-secondary mb-0">Current page: <strong>{{ example.page }}</strong></p>\r
`,a=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-basic-pagination",\r
    controllerAs: "example",\r
    templateUrl: "./basic-pagination.component.html",\r
    styleUrl: "./basic-pagination.component.css",\r
})\r
export class BasicPaginationComponent {\r
    public page = 4;\r
\r
    public selectPage(page: number) {\r
        this.page = page;\r
    }\r
}\r
`,o=`<ngb-pagination\r
    collection-size="50"\r
    page="example.page"\r
    page-change="example.selectPage($event)">\r
    <ng-template ngb-pagination-previous>\r
        <span aria-hidden="true">←</span> Previous\r
    </ng-template>\r
    <ng-template ngb-pagination-next>\r
        Next <span aria-hidden="true">→</span>\r
    </ng-template>\r
    <ng-template ngb-pagination-number let-page>\r
        <span class="fw-semibold">{{ page }}</span>\r
    </ng-template>\r
</ngb-pagination>\r
`,s=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-custom-pagination",\r
    controllerAs: "example",\r
    templateUrl: "./custom-pagination.component.html",\r
    styleUrl: "./custom-pagination.component.css",\r
})\r
export class CustomPaginationComponent {\r
    public page = 3;\r
\r
    public selectPage(page: number) {\r
        this.page = page;\r
    }\r
}\r
`,c=`<div class="form-check form-switch mb-3">\r
    <input class="form-check-input" type="checkbox" role="switch" id="pagination-disabled" ng-model="example.disabled">\r
    <label class="form-check-label" for="pagination-disabled">Disabled</label>\r
</div>\r
\r
<ngb-pagination\r
    collection-size="70"\r
    page="example.page"\r
    page-change="example.selectPage($event)"\r
    ng-disabled="example.disabled">\r
</ngb-pagination>\r
`,l=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-disabled-pagination",\r
    controllerAs: "example",\r
    templateUrl: "./disabled-pagination.component.html",\r
    styleUrl: "./disabled-pagination.component.css",\r
})\r
export class DisabledPaginationComponent {\r
    public page = 3;\r
    public disabled = true;\r
\r
    public selectPage(page: number) {\r
        this.page = page;\r
    }\r
}\r
`,u=`<div class="vstack gap-4">\r
    <div>\r
        <p class="small text-body-secondary mb-2">Start</p>\r
        <ngb-pagination class="d-flex justify-content-start" collection-size="50" page="example.startPage" page-change="example.selectStartPage($event)"></ngb-pagination>\r
    </div>\r
    <div>\r
        <p class="small text-body-secondary text-center mb-2">Center</p>\r
        <ngb-pagination class="d-flex justify-content-center" collection-size="50" page="example.centerPage" page-change="example.selectCenterPage($event)"></ngb-pagination>\r
    </div>\r
    <div>\r
        <p class="small text-body-secondary text-end mb-2">End</p>\r
        <ngb-pagination class="d-flex justify-content-end" collection-size="50" page="example.endPage" page-change="example.selectEndPage($event)"></ngb-pagination>\r
    </div>\r
</div>\r
`,d=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-pagination-alignment",\r
    controllerAs: "example",\r
    templateUrl: "./pagination-alignment.component.html",\r
    styleUrl: "./pagination-alignment.component.css",\r
})\r
export class PaginationAlignmentComponent {\r
    public startPage = 2;\r
    public centerPage = 2;\r
    public endPage = 2;\r
\r
    public selectStartPage(page: number) { this.startPage = page; }\r
    public selectCenterPage(page: number) { this.centerPage = page; }\r
    public selectEndPage(page: number) { this.endPage = page; }\r
}\r
`,f=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            Pagination is small, rotating, limited to five pages and uses boundary links without direction links.\r
        </p>\r
    </div>\r
</div>\r
\r
<ngb-pagination\r
    collection-size="200"\r
    page="example.page"\r
    page-change="example.selectPage($event)">\r
</ngb-pagination>\r
`,p=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbPaginationConfig, NGB_PAGINATION_CONFIG } from "ngb-js/pagination";\r
\r
@Component({\r
    selector: "docs-pagination-global",\r
    controllerAs: "example",\r
    templateUrl: "./pagination-global.component.html",\r
    styleUrl: "./pagination-global.component.css",\r
})\r
export class PaginationGlobalComponent implements AfterViewInit, OnDestroy {\r
    public page = 8;\r
\r
    private readonly initialConfig: Pick<\r
        NgbPaginationConfig,\r
        "boundaryLinks" | "directionLinks" | "maxSize" | "rotate" | "size"\r
    >;\r
\r
    constructor(@Inject(NGB_PAGINATION_CONFIG) private readonly config: NgbPaginationConfig) {\r
        this.initialConfig = {\r
            boundaryLinks: config.boundaryLinks,\r
            directionLinks: config.directionLinks,\r
            maxSize: config.maxSize,\r
            rotate: config.rotate,\r
            size: config.size,\r
        };\r
\r
        config.boundaryLinks = true;\r
        config.directionLinks = false;\r
        config.maxSize = 5;\r
        config.rotate = true;\r
        config.size = "sm";\r
    }\r
\r
    public selectPage(page: number) {\r
        this.page = page;\r
    }\r
\r
    public ngAfterViewInit() {\r
        this.restoreConfig();\r
    }\r
\r
    public ngOnDestroy() {\r
        this.restoreConfig();\r
    }\r
\r
    private restoreConfig() {\r
        this.config.boundaryLinks = this.initialConfig.boundaryLinks;\r
        this.config.directionLinks = this.initialConfig.directionLinks;\r
        this.config.maxSize = this.initialConfig.maxSize;\r
        this.config.rotate = this.initialConfig.rotate;\r
        this.config.size = this.initialConfig.size;\r
    }\r
}\r
`,m=`<div class="vstack gap-4">\r
    <div>\r
        <p class="small text-body-secondary mb-2">Small</p>\r
        <ngb-pagination collection-size="50" page="example.smallPage" page-change="example.selectSmallPage($event)" size="'sm'"></ngb-pagination>\r
    </div>\r
    <div>\r
        <p class="small text-body-secondary mb-2">Default</p>\r
        <ngb-pagination collection-size="50" page="example.defaultPage" page-change="example.selectDefaultPage($event)"></ngb-pagination>\r
    </div>\r
    <div>\r
        <p class="small text-body-secondary mb-2">Large</p>\r
        <ngb-pagination collection-size="50" page="example.largePage" page-change="example.selectLargePage($event)" size="'lg'"></ngb-pagination>\r
    </div>\r
</div>\r
`,h=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-pagination-size",\r
    controllerAs: "example",\r
    templateUrl: "./pagination-size.component.html",\r
    styleUrl: "./pagination-size.component.css",\r
})\r
export class PaginationSizeComponent {\r
    public smallPage = 2;\r
    public defaultPage = 2;\r
    public largePage = 2;\r
\r
    public selectSmallPage(page: number) { this.smallPage = page; }\r
    public selectDefaultPage(page: number) { this.defaultPage = page; }\r
    public selectLargePage(page: number) { this.largePage = page; }\r
}\r
`,g=class{examples={basic:{html:i,typescript:a},advanced:{html:n,typescript:r},custom:{html:o,typescript:s},size:{html:m,typescript:h},alignment:{html:u,typescript:d},disabled:{html:c,typescript:l},global:{html:f,typescript:p}}};g=t([e({selector:`docs-pagination-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/pagination-examples-page.component-455c60b7.html`,styleUrl:`./pagination-examples-page.component.css`})],g);export{g as PaginationExamplesPageComponent};