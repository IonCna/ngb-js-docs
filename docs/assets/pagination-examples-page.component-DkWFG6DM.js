import{d as e,f as t}from"./index-PqXhwIf1.js";var n=`<div class="vstack gap-4">
    <div>
        <p class="small fw-semibold mb-2">Restricted page range</p>
        <ngb-pagination
            collection-size="120"
            page="example.paginatedPage"
            page-change="example.selectPaginatedPage($event)"
            max-size="5"
            boundary-links="true">
        </ngb-pagination>
    </div>

    <div>
        <p class="small fw-semibold mb-2">Rotating page range</p>
        <ngb-pagination
            collection-size="240"
            page="example.rotatedPage"
            page-change="example.selectRotatedPage($event)"
            max-size="5"
            rotate="true"
            boundary-links="true">
        </ngb-pagination>
    </div>

    <div>
        <p class="small fw-semibold mb-2">Without ellipses</p>
        <ngb-pagination
            collection-size="240"
            page="example.compactPage"
            page-change="example.selectCompactPage($event)"
            max-size="5"
            rotate="true"
            ellipses="false">
        </ngb-pagination>
    </div>
</div>
`,r=`import { Component } from "ngjs-core";

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
`,i=`<ngb-pagination
    collection-size="70"
    page="example.page"
    page-change="example.selectPage($event)">
</ngb-pagination>

<p class="small text-body-secondary mb-0">Current page: <strong>{{ example.page }}</strong></p>
`,a=`import { Component } from "ngjs-core";

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
`,o=`<ngb-pagination
    collection-size="50"
    page="example.page"
    page-change="example.selectPage($event)">
    <ng-template ngb-pagination-previous>
        <span aria-hidden="true">←</span> Previous
    </ng-template>
    <ng-template ngb-pagination-next>
        Next <span aria-hidden="true">→</span>
    </ng-template>
    <ng-template ngb-pagination-number let-page>
        <span class="fw-semibold">{{ page }}</span>
    </ng-template>
</ngb-pagination>
`,s=`import { Component } from "ngjs-core";

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
`,c=`<div class="form-check form-switch mb-3">
    <input class="form-check-input" type="checkbox" role="switch" id="pagination-disabled" ng-model="example.disabled">
    <label class="form-check-label" for="pagination-disabled">Disabled</label>
</div>

<ngb-pagination
    collection-size="70"
    page="example.page"
    page-change="example.selectPage($event)"
    ng-disabled="example.disabled">
</ngb-pagination>
`,l=`import { Component } from "ngjs-core";

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
`,u=`<div class="vstack gap-4">
    <div>
        <p class="small text-body-secondary mb-2">Start</p>
        <ngb-pagination class="d-flex justify-content-start" collection-size="50" page="example.startPage" page-change="example.selectStartPage($event)"></ngb-pagination>
    </div>
    <div>
        <p class="small text-body-secondary text-center mb-2">Center</p>
        <ngb-pagination class="d-flex justify-content-center" collection-size="50" page="example.centerPage" page-change="example.selectCenterPage($event)"></ngb-pagination>
    </div>
    <div>
        <p class="small text-body-secondary text-end mb-2">End</p>
        <ngb-pagination class="d-flex justify-content-end" collection-size="50" page="example.endPage" page-change="example.selectEndPage($event)"></ngb-pagination>
    </div>
</div>
`,d=`import { Component } from "ngjs-core";

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
`,f=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            Pagination is small, rotating, limited to five pages and uses boundary links without direction links.
        </p>
    </div>
</div>

<ngb-pagination
    collection-size="200"
    page="example.page"
    page-change="example.selectPage($event)">
</ngb-pagination>
`,p=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
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
`,m=`<div class="vstack gap-4">
    <div>
        <p class="small text-body-secondary mb-2">Small</p>
        <ngb-pagination collection-size="50" page="example.smallPage" page-change="example.selectSmallPage($event)" size="'sm'"></ngb-pagination>
    </div>
    <div>
        <p class="small text-body-secondary mb-2">Default</p>
        <ngb-pagination collection-size="50" page="example.defaultPage" page-change="example.selectDefaultPage($event)"></ngb-pagination>
    </div>
    <div>
        <p class="small text-body-secondary mb-2">Large</p>
        <ngb-pagination collection-size="50" page="example.largePage" page-change="example.selectLargePage($event)" size="'lg'"></ngb-pagination>
    </div>
</div>
`,h=`import { Component } from "ngjs-core";

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
`,g=class{examples={basic:{html:i,typescript:a},advanced:{html:n,typescript:r},custom:{html:o,typescript:s},size:{html:m,typescript:h},alignment:{html:u,typescript:d},disabled:{html:c,typescript:l},global:{html:f,typescript:p}}};g=e([t({selector:`docs-pagination-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/pagination-examples-page.component-f7c00289.html`,styleUrl:`./pagination-examples-page.component.css`})],g);export{g as PaginationExamplesPageComponent};