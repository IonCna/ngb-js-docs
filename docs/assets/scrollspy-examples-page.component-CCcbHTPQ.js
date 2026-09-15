import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component, ElementRef, type OnDestroy } from "ngjs-core";\r
import { NgbScrollSpyService } from "ngb-js/scrollspy";\r
\r
@Component({\r
    selector: "docs-scrollspy-service-demo",\r
    controllerAs: "example",\r
    templateUrl: "./scrollspy-service-demo.component.html",\r
    styleUrl: "./scrollspy-service-demo.component.css",\r
})\r
export class ScrollspyServiceDemoComponent implements OnDestroy {\r
    public readonly fragments = ["service-introduction", "service-options", "service-finish"];\r
    public running = false;\r
    public observingFinish = true;\r
    private root?: HTMLElement;\r
\r
    constructor(\r
        private readonly elementRef: ElementRef<HTMLElement>,\r
        public readonly scrollSpy: NgbScrollSpyService,\r
    ) {}\r
\r
    public ngAfterViewInit(): void {\r
        this.root = this.elementRef.nativeElement.querySelector<HTMLElement>("[data-service-scrollspy]") ?? undefined;\r
        this.start();\r
    }\r
\r
    public ngOnDestroy(): void {\r
        this.scrollSpy.stop();\r
    }\r
\r
    public start(): void {\r
        if (!this.root) return;\r
        this.scrollSpy.start({\r
            root: this.root,\r
            fragments: this.fragments,\r
            rootMargin: "0px 0px -45%",\r
        });\r
        this.running = true;\r
        this.observingFinish = true;\r
    }\r
\r
    public stop(): void {\r
        this.scrollSpy.stop();\r
        this.running = false;\r
    }\r
\r
    public toggleFinish(): void {\r
        if (this.observingFinish) {\r
            this.scrollSpy.unobserve("service-finish");\r
        } else {\r
            this.scrollSpy.observe("service-finish");\r
        }\r
        this.observingFinish = !this.observingFinish;\r
    }\r
}\r
`,r=`<div class="d-flex flex-wrap align-items-center gap-2 mb-3">\r
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.start()" ng-disabled="example.running">Start</button>\r
    <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.stop()" ng-disabled="!example.running">Stop</button>\r
    <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.toggleFinish()" ng-disabled="!example.running">\r
        {{ example.observingFinish ? 'Unobserve' : 'Observe' }} finish\r
    </button>\r
    <span class="small text-body-secondary ms-sm-auto">\r
        Active: <code>{{ example.scrollSpy.active || 'none' }}</code>\r
    </span>\r
</div>\r
\r
<div class="row g-3">\r
    <div class="col-md-4">\r
        <div class="nav nav-pills flex-column">\r
            <button type="button" class="nav-link text-start" ng-click="example.scrollSpy.scrollTo('service-introduction')">Introduction</button>\r
            <button type="button" class="nav-link text-start" ng-click="example.scrollSpy.scrollTo('service-options')">Options</button>\r
            <button type="button" class="nav-link text-start" ng-click="example.scrollSpy.scrollTo('service-finish')">Finish</button>\r
        </div>\r
    </div>\r
\r
    <div class="col-md-8">\r
        <div class="bg-body-tertiary border rounded p-3 overflow-y-auto" style="height: 17rem" data-service-scrollspy>\r
            <section id="service-introduction" class="pb-5">\r
                <h3 class="h5">Introduction</h3>\r
                <p>The service can observe ordinary DOM elements without scrollspy directives.</p>\r
            </section>\r
            <section id="service-options" class="pb-5">\r
                <h3 class="h5">Options</h3>\r
                <p>Call <code>start()</code> with a root element and the fragment ids to observe.</p>\r
            </section>\r
            <section id="service-finish" class="pb-5 mb-5">\r
                <h3 class="h5">Finish</h3>\r
                <p class="mb-5"><code>observe()</code>, <code>unobserve()</code>, <code>scrollTo()</code> and <code>stop()</code> remain available programmatically.</p>\r
            </section>\r
        </div>\r
    </div>\r
</div>\r
`,i=`<div\r
    class="bg-body-tertiary border rounded p-3 mb-3"\r
    style="height: 14rem"\r
    ngb-scroll-spy\r
    root-margin="0px 0px -45%"\r
    ng-ref="example.spy"\r
    ng-ref-read="ngbScrollSpy">\r
    <section class="pb-5" ngb-scroll-spy-fragment="basic-scrollspy-first">\r
        <h3 class="h5">First heading</h3>\r
        <p>Scrollspy observes each registered fragment and keeps track of the section currently crossing the viewport.</p>\r
    </section>\r
    <section class="pb-5" ngb-scroll-spy-fragment="basic-scrollspy-second">\r
        <h3 class="h5">Second heading</h3>\r
        <p>The scroll container is the element carrying the <code>ngb-scroll-spy</code> directive.</p>\r
    </section>\r
    <section class="pb-5 mb-5" ngb-scroll-spy-fragment="basic-scrollspy-third">\r
        <h3 class="h5">Third heading</h3>\r
        <p class="mb-5">Every fragment gets its DOM id from <code>ngb-scroll-spy-fragment</code>.</p>\r
    </section>\r
</div>\r
\r
<p class="small text-body-secondary mb-0">\r
    Active fragment: <code>{{ example.spy.active || 'none' }}</code>\r
</p>\r
`,a=`<div class="d-flex flex-column">\r
    <div\r
        class="bg-body-tertiary border rounded p-3 order-2"\r
        style="height: 15rem"\r
        ngb-scroll-spy\r
        root-margin="0px 0px -45%"\r
        ng-ref="example.spy"\r
        ng-ref-read="ngbScrollSpy">\r
        <section class="pb-5" ngb-scroll-spy-fragment="navbar-overview">\r
            <h3 class="h5">Overview</h3>\r
            <p>The menu can live outside the observed container when it receives an explicit scrollspy reference.</p>\r
        </section>\r
        <section class="pb-5" ngb-scroll-spy-fragment="navbar-features">\r
            <h3 class="h5">Features</h3>\r
            <p>Bootstrap navbar and nav utilities provide the layout while ngb-js manages navigation state.</p>\r
        </section>\r
        <section class="pb-5 mb-5" ngb-scroll-spy-fragment="navbar-summary">\r
            <h3 class="h5">Summary</h3>\r
            <p class="mb-5">Selecting a navbar item scrolls this container without moving the surrounding page.</p>\r
        </section>\r
    </div>\r
\r
    <nav class="navbar bg-body-tertiary border rounded px-3 mb-3 order-1">\r
        <span class="navbar-brand mb-0 h1">Docs</span>\r
        <div class="nav nav-pills" ngb-scroll-spy-menu="example.spy">\r
            <button type="button" class="nav-link" ngb-scroll-spy-item="navbar-overview">Overview</button>\r
            <button type="button" class="nav-link" ngb-scroll-spy-item="navbar-features">Features</button>\r
            <button type="button" class="nav-link" ngb-scroll-spy-item="navbar-summary">Summary</button>\r
        </div>\r
    </nav>\r
</div>\r
`,o=`<div class="row g-3">\r
    <div class="col-md-8 order-2">\r
        <div\r
            class="bg-body-tertiary border rounded p-3"\r
            style="height: 18rem"\r
            ngb-scroll-spy\r
            root-margin="0px 0px -45%"\r
            ng-ref="example.spy"\r
            ng-ref-read="ngbScrollSpy">\r
            <section class="pb-4" ngb-scroll-spy-fragment="nested-guide">\r
                <h3 class="h4">Guide</h3>\r
                <p>A parent item can represent a complete group of related sections.</p>\r
            </section>\r
            <section class="pb-5" ngb-scroll-spy-fragment="nested-install">\r
                <h4 class="h5">Install</h4>\r
                <p>Child items use <code>parent</code> to activate both their own entry and the group entry.</p>\r
            </section>\r
            <section class="pb-5" ngb-scroll-spy-fragment="nested-configure">\r
                <h4 class="h5">Configure</h4>\r
                <p>The menu directive coordinates the active state across every descendant item.</p>\r
            </section>\r
            <section class="pb-5 mb-5" ngb-scroll-spy-fragment="nested-reference">\r
                <h3 class="h4">Reference</h3>\r
                <p class="mb-5">Top-level entries continue to work alongside nested groups.</p>\r
            </section>\r
        </div>\r
    </div>\r
\r
    <div class="col-md-4 order-1">\r
        <nav class="nav nav-pills flex-column" ngb-scroll-spy-menu="example.spy" aria-label="Nested example navigation">\r
            <button type="button" class="nav-link text-start" ngb-scroll-spy-item="nested-guide">Guide</button>\r
            <nav class="nav nav-pills flex-column ms-3">\r
                <button type="button" class="nav-link text-start my-1" ngb-scroll-spy-item="nested-install" parent="nested-guide">Install</button>\r
                <button type="button" class="nav-link text-start my-1" ngb-scroll-spy-item="nested-configure" parent="nested-guide">Configure</button>\r
            </nav>\r
            <button type="button" class="nav-link text-start" ngb-scroll-spy-item="nested-reference">Reference</button>\r
        </nav>\r
    </div>\r
</div>\r
`,s=`<div class="row g-3">\r
    <div class="col-md-8 order-2">\r
        <div\r
            class="bg-body-tertiary border rounded p-3"\r
            style="height: 16rem"\r
            ngb-scroll-spy\r
            root-margin="0px 0px -45%"\r
            ng-ref="example.spy"\r
            ng-ref-read="ngbScrollSpy">\r
            <section class="pb-5" ngb-scroll-spy-fragment="menu-items-first">\r
                <h3 class="h5">First section</h3>\r
                <p>Clicking an item asks the referenced scrollspy to move to its matching fragment.</p>\r
            </section>\r
            <section class="pb-5" ngb-scroll-spy-fragment="menu-items-second">\r
                <h3 class="h5">Second section</h3>\r
                <p>The active item receives Bootstrap's <code>active</code> class automatically.</p>\r
            </section>\r
            <section class="pb-5 mb-5" ngb-scroll-spy-fragment="menu-items-third">\r
                <h3 class="h5">Third section</h3>\r
                <p class="mb-5">Items can be buttons or links; their fragment identifier is the important part.</p>\r
            </section>\r
        </div>\r
    </div>\r
\r
    <div class="col-md-4 order-1">\r
        <div class="list-group" ngb-scroll-spy-menu="example.spy">\r
            <button type="button" class="list-group-item list-group-item-action" ngb-scroll-spy-item="menu-items-first">First</button>\r
            <button type="button" class="list-group-item list-group-item-action" ngb-scroll-spy-item="menu-items-second">Second</button>\r
            <a role="button" class="list-group-item list-group-item-action" ngb-scroll-spy-item="menu-items-third">Third</a>\r
        </div>\r
    </div>\r
</div>\r
`,c=class{examples={basic:{html:i},menuItems:{html:s},nested:{html:o},navbar:{html:a},service:{html:r,typescript:n}}};c=t([e({selector:`docs-scrollspy-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/scrollspy-examples-page.component-35af7f4f.html`,styleUrl:`./scrollspy-examples-page.component.css`})],c);export{c as ScrollspyExamplesPageComponent};