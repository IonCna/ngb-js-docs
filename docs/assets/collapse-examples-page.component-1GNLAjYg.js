import{d as e,f as t}from"./index-B9XAkpig.js";var n=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-horizontal-collapse",
    controllerAs: "example",
    templateUrl: "./horizontal-collapse.component.html",
    styleUrl: "./horizontal-collapse.component.css",
})
export class HorizontalCollapseComponent {
    public collapsed = true;

    public toggle() {
        this.collapsed = !this.collapsed;
    }
}
`,r=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-navbar-collapse",
    controllerAs: "example",
    templateUrl: "./navbar-collapse.component.html",
    styleUrl: "./navbar-collapse.component.css",
})
export class NavbarCollapseComponent {
    public menuCollapsed = true;

    public toggleMenu() {
        this.menuCollapsed = !this.menuCollapsed;
    }

    public closeMenu() {
        this.menuCollapsed = true;
    }
}
`,i=`import type { INgbCollapse } from "ngb-js/collapse";
import { Component, ViewChild } from "ngjs-core";

@Component({
    selector: "docs-simple-collapse",
    controllerAs: "example",
    templateUrl: "./simple-collapse.component.html",
    styleUrl: "./simple-collapse.component.css",
})
export class SimpleCollapseComponent {
    @ViewChild("collapse", { static: true })
    private collapse!: INgbCollapse;

    public collapsed = true;

    public toggleWithController() {
        this.collapse.toggle();
    }

    public toggleWithBinding() {
        this.collapsed = !this.collapsed;
    }
}
`,a=`<div class="d-flex flex-wrap gap-2 mb-3">
    <button
        type="button"
        class="btn btn-primary"
        ng-click="example.toggleWithController()"
        ng-attr-aria-expanded="{{ !example.collapsed }}"
        aria-controls="simple-collapse-panel">
        Toggle with controller
    </button>

    <button
        type="button"
        class="btn btn-outline-primary"
        ng-click="example.toggleWithBinding()"
        ng-attr-aria-expanded="{{ !example.collapsed }}"
        aria-controls="simple-collapse-panel">
        Toggle with two-way binding
    </button>
</div>

<div
    id="simple-collapse-panel"
    ngb-collapse="example.collapsed"
    ngb-collapse-change="example.collapsed = $event"
    ng-ref="collapse"
    ng-ref-read="ngbCollapse">
    <div class="card">
        <div class="card-body">
            Both buttons control this panel. One calls the controller and the other changes the bound value.
        </div>
    </div>
</div>
`,o=`<button
    type="button"
    class="btn btn-primary mb-3"
    ng-click="example.toggle()"
    ng-attr-aria-expanded="{{ !example.collapsed }}"
    aria-controls="horizontal-collapse-panel">
    Toggle width
</button>

<div class="d-flex">
    <div
        id="horizontal-collapse-panel"
        ngb-collapse="example.collapsed"
        horizontal="true">
        <div class="card card-body text-nowrap">
            This content collapses horizontally.
        </div>
    </div>
</div>
`,s=`<p class="text-body-secondary mb-3">
    Resize the viewport to see the navigation switch between its expanded and collapsed layouts.
</p>

<nav class="navbar navbar-expand-lg bg-body-tertiary border rounded">
    <div class="container-fluid">
        <span class="navbar-brand mb-0">NgbJS</span>

        <button
            type="button"
            class="navbar-toggler"
            ng-click="example.toggleMenu()"
            ng-attr-aria-expanded="{{ !example.menuCollapsed }}"
            aria-controls="collapse-navbar-menu"
            aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div
            id="collapse-navbar-menu"
            class="navbar-collapse"
            ngb-collapse="example.menuCollapsed">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <button type="button" class="nav-link active" ng-click="example.closeMenu()">Features</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" ng-click="example.closeMenu()">Examples</button>
                </li>
                <li class="nav-item">
                    <button type="button" class="nav-link" ng-click="example.closeMenu()">About</button>
                </li>
            </ul>
        </div>
    </div>
</nav>
`,c=class{examples={simple:{html:a,typescript:i},horizontal:{html:o,typescript:n},navbar:{html:s,typescript:r}}};c=e([t({selector:`docs-collapse-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/collapse-examples-page.component-e972d2a9.html`,styleUrl:`./collapse-examples-page.component.css`})],c);export{c as CollapseExamplesPageComponent};