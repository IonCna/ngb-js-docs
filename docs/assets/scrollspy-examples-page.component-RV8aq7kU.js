import{d as e,f as t}from"./index-B9XAkpig.js";var n=`import { Component, ElementRef, type OnDestroy } from "ngjs-core";
import { NgbScrollSpyService } from "ngb-js/scrollspy";

@Component({
    selector: "docs-scrollspy-service-demo",
    controllerAs: "example",
    templateUrl: "./scrollspy-service-demo.component.html",
    styleUrl: "./scrollspy-service-demo.component.css",
})
export class ScrollspyServiceDemoComponent implements OnDestroy {
    public readonly fragments = ["service-introduction", "service-options", "service-finish"];
    public running = false;
    public observingFinish = true;
    private root?: HTMLElement;

    constructor(
        private readonly elementRef: ElementRef<HTMLElement>,
        public readonly scrollSpy: NgbScrollSpyService,
    ) {}

    public ngAfterViewInit(): void {
        this.root = this.elementRef.nativeElement.querySelector<HTMLElement>("[data-service-scrollspy]") ?? undefined;
        this.start();
    }

    public ngOnDestroy(): void {
        this.scrollSpy.stop();
    }

    public start(): void {
        if (!this.root) return;
        this.scrollSpy.start({
            root: this.root,
            fragments: this.fragments,
            rootMargin: "0px 0px -45%",
        });
        this.running = true;
        this.observingFinish = true;
    }

    public stop(): void {
        this.scrollSpy.stop();
        this.running = false;
    }

    public toggleFinish(): void {
        if (this.observingFinish) {
            this.scrollSpy.unobserve("service-finish");
        } else {
            this.scrollSpy.observe("service-finish");
        }
        this.observingFinish = !this.observingFinish;
    }
}
`,r=`<div class="d-flex flex-wrap align-items-center gap-2 mb-3">
    <button type="button" class="btn btn-sm btn-outline-primary" ng-click="example.start()" ng-disabled="example.running">Start</button>
    <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.stop()" ng-disabled="!example.running">Stop</button>
    <button type="button" class="btn btn-sm btn-outline-secondary" ng-click="example.toggleFinish()" ng-disabled="!example.running">
        {{ example.observingFinish ? 'Unobserve' : 'Observe' }} finish
    </button>
    <span class="small text-body-secondary ms-sm-auto">
        Active: <code>{{ example.scrollSpy.active || 'none' }}</code>
    </span>
</div>

<div class="row g-3">
    <div class="col-md-4">
        <div class="nav nav-pills flex-column">
            <button type="button" class="nav-link text-start" ng-click="example.scrollSpy.scrollTo('service-introduction')">Introduction</button>
            <button type="button" class="nav-link text-start" ng-click="example.scrollSpy.scrollTo('service-options')">Options</button>
            <button type="button" class="nav-link text-start" ng-click="example.scrollSpy.scrollTo('service-finish')">Finish</button>
        </div>
    </div>

    <div class="col-md-8">
        <div class="bg-body-tertiary border rounded p-3 overflow-y-auto" style="height: 17rem" data-service-scrollspy>
            <section id="service-introduction" class="pb-5">
                <h3 class="h5">Introduction</h3>
                <p>The service can observe ordinary DOM elements without scrollspy directives.</p>
            </section>
            <section id="service-options" class="pb-5">
                <h3 class="h5">Options</h3>
                <p>Call <code>start()</code> with a root element and the fragment ids to observe.</p>
            </section>
            <section id="service-finish" class="pb-5 mb-5">
                <h3 class="h5">Finish</h3>
                <p class="mb-5"><code>observe()</code>, <code>unobserve()</code>, <code>scrollTo()</code> and <code>stop()</code> remain available programmatically.</p>
            </section>
        </div>
    </div>
</div>
`,i=`<div
    class="bg-body-tertiary border rounded p-3 mb-3"
    style="height: 14rem"
    ngb-scroll-spy
    root-margin="0px 0px -45%"
    ng-ref="example.spy"
    ng-ref-read="ngbScrollSpy">
    <section class="pb-5" ngb-scroll-spy-fragment="basic-scrollspy-first">
        <h3 class="h5">First heading</h3>
        <p>Scrollspy observes each registered fragment and keeps track of the section currently crossing the viewport.</p>
    </section>
    <section class="pb-5" ngb-scroll-spy-fragment="basic-scrollspy-second">
        <h3 class="h5">Second heading</h3>
        <p>The scroll container is the element carrying the <code>ngb-scroll-spy</code> directive.</p>
    </section>
    <section class="pb-5 mb-5" ngb-scroll-spy-fragment="basic-scrollspy-third">
        <h3 class="h5">Third heading</h3>
        <p class="mb-5">Every fragment gets its DOM id from <code>ngb-scroll-spy-fragment</code>.</p>
    </section>
</div>

<p class="small text-body-secondary mb-0">
    Active fragment: <code>{{ example.spy.active || 'none' }}</code>
</p>
`,a=`<div class="d-flex flex-column">
    <div
        class="bg-body-tertiary border rounded p-3 order-2"
        style="height: 15rem"
        ngb-scroll-spy
        root-margin="0px 0px -45%"
        ng-ref="example.spy"
        ng-ref-read="ngbScrollSpy">
        <section class="pb-5" ngb-scroll-spy-fragment="navbar-overview">
            <h3 class="h5">Overview</h3>
            <p>The menu can live outside the observed container when it receives an explicit scrollspy reference.</p>
        </section>
        <section class="pb-5" ngb-scroll-spy-fragment="navbar-features">
            <h3 class="h5">Features</h3>
            <p>Bootstrap navbar and nav utilities provide the layout while ngb-js manages navigation state.</p>
        </section>
        <section class="pb-5 mb-5" ngb-scroll-spy-fragment="navbar-summary">
            <h3 class="h5">Summary</h3>
            <p class="mb-5">Selecting a navbar item scrolls this container without moving the surrounding page.</p>
        </section>
    </div>

    <nav class="navbar bg-body-tertiary border rounded px-3 mb-3 order-1">
        <span class="navbar-brand mb-0 h1">Docs</span>
        <div class="nav nav-pills" ngb-scroll-spy-menu="example.spy">
            <button type="button" class="nav-link" ngb-scroll-spy-item="navbar-overview">Overview</button>
            <button type="button" class="nav-link" ngb-scroll-spy-item="navbar-features">Features</button>
            <button type="button" class="nav-link" ngb-scroll-spy-item="navbar-summary">Summary</button>
        </div>
    </nav>
</div>
`,o=`<div class="row g-3">
    <div class="col-md-8 order-2">
        <div
            class="bg-body-tertiary border rounded p-3"
            style="height: 18rem"
            ngb-scroll-spy
            root-margin="0px 0px -45%"
            ng-ref="example.spy"
            ng-ref-read="ngbScrollSpy">
            <section class="pb-4" ngb-scroll-spy-fragment="nested-guide">
                <h3 class="h4">Guide</h3>
                <p>A parent item can represent a complete group of related sections.</p>
            </section>
            <section class="pb-5" ngb-scroll-spy-fragment="nested-install">
                <h4 class="h5">Install</h4>
                <p>Child items use <code>parent</code> to activate both their own entry and the group entry.</p>
            </section>
            <section class="pb-5" ngb-scroll-spy-fragment="nested-configure">
                <h4 class="h5">Configure</h4>
                <p>The menu directive coordinates the active state across every descendant item.</p>
            </section>
            <section class="pb-5 mb-5" ngb-scroll-spy-fragment="nested-reference">
                <h3 class="h4">Reference</h3>
                <p class="mb-5">Top-level entries continue to work alongside nested groups.</p>
            </section>
        </div>
    </div>

    <div class="col-md-4 order-1">
        <nav class="nav nav-pills flex-column" ngb-scroll-spy-menu="example.spy" aria-label="Nested example navigation">
            <button type="button" class="nav-link text-start" ngb-scroll-spy-item="nested-guide">Guide</button>
            <nav class="nav nav-pills flex-column ms-3">
                <button type="button" class="nav-link text-start my-1" ngb-scroll-spy-item="nested-install" parent="nested-guide">Install</button>
                <button type="button" class="nav-link text-start my-1" ngb-scroll-spy-item="nested-configure" parent="nested-guide">Configure</button>
            </nav>
            <button type="button" class="nav-link text-start" ngb-scroll-spy-item="nested-reference">Reference</button>
        </nav>
    </div>
</div>
`,s=`<div class="row g-3">
    <div class="col-md-8 order-2">
        <div
            class="bg-body-tertiary border rounded p-3"
            style="height: 16rem"
            ngb-scroll-spy
            root-margin="0px 0px -45%"
            ng-ref="example.spy"
            ng-ref-read="ngbScrollSpy">
            <section class="pb-5" ngb-scroll-spy-fragment="menu-items-first">
                <h3 class="h5">First section</h3>
                <p>Clicking an item asks the referenced scrollspy to move to its matching fragment.</p>
            </section>
            <section class="pb-5" ngb-scroll-spy-fragment="menu-items-second">
                <h3 class="h5">Second section</h3>
                <p>The active item receives Bootstrap's <code>active</code> class automatically.</p>
            </section>
            <section class="pb-5 mb-5" ngb-scroll-spy-fragment="menu-items-third">
                <h3 class="h5">Third section</h3>
                <p class="mb-5">Items can be buttons or links; their fragment identifier is the important part.</p>
            </section>
        </div>
    </div>

    <div class="col-md-4 order-1">
        <div class="list-group" ngb-scroll-spy-menu="example.spy">
            <button type="button" class="list-group-item list-group-item-action" ngb-scroll-spy-item="menu-items-first">First</button>
            <button type="button" class="list-group-item list-group-item-action" ngb-scroll-spy-item="menu-items-second">Second</button>
            <a role="button" class="list-group-item list-group-item-action" ngb-scroll-spy-item="menu-items-third">Third</a>
        </div>
    </div>
</div>
`,c=class{examples={basic:{html:i},menuItems:{html:s},nested:{html:o},navbar:{html:a},service:{html:r,typescript:n}}};c=e([t({selector:`docs-scrollspy-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/scrollspy-examples-page.component-1d4179fb.html`,styleUrl:`./scrollspy-examples-page.component.css`})],c);export{c as ScrollspyExamplesPageComponent};