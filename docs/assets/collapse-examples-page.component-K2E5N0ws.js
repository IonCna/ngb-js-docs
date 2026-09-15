import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-horizontal-collapse",\r
    controllerAs: "example",\r
    templateUrl: "./horizontal-collapse.component.html",\r
    styleUrl: "./horizontal-collapse.component.css",\r
})\r
export class HorizontalCollapseComponent {\r
    public collapsed = true;\r
\r
    public toggle() {\r
        this.collapsed = !this.collapsed;\r
    }\r
}\r
`,r=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-navbar-collapse",\r
    controllerAs: "example",\r
    templateUrl: "./navbar-collapse.component.html",\r
    styleUrl: "./navbar-collapse.component.css",\r
})\r
export class NavbarCollapseComponent {\r
    public menuCollapsed = true;\r
\r
    public toggleMenu() {\r
        this.menuCollapsed = !this.menuCollapsed;\r
    }\r
\r
    public closeMenu() {\r
        this.menuCollapsed = true;\r
    }\r
}\r
`,i=`import type { INgbCollapse } from "ngb-js/collapse";\r
import { Component, ViewChild } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-simple-collapse",\r
    controllerAs: "example",\r
    templateUrl: "./simple-collapse.component.html",\r
    styleUrl: "./simple-collapse.component.css",\r
})\r
export class SimpleCollapseComponent {\r
    @ViewChild("collapse", { static: true })\r
    private collapse!: INgbCollapse;\r
\r
    public collapsed = true;\r
\r
    public toggleWithController() {\r
        this.collapse.toggle();\r
    }\r
\r
    public toggleWithBinding() {\r
        this.collapsed = !this.collapsed;\r
    }\r
}\r
`,a=`<div class="d-flex flex-wrap gap-2 mb-3">\r
    <button\r
        type="button"\r
        class="btn btn-primary"\r
        ng-click="example.toggleWithController()"\r
        ng-attr-aria-expanded="{{ !example.collapsed }}"\r
        aria-controls="simple-collapse-panel">\r
        Toggle with controller\r
    </button>\r
\r
    <button\r
        type="button"\r
        class="btn btn-outline-primary"\r
        ng-click="example.toggleWithBinding()"\r
        ng-attr-aria-expanded="{{ !example.collapsed }}"\r
        aria-controls="simple-collapse-panel">\r
        Toggle with two-way binding\r
    </button>\r
</div>\r
\r
<div\r
    id="simple-collapse-panel"\r
    ngb-collapse="example.collapsed"\r
    ngb-collapse-change="example.collapsed = $event"\r
    ng-ref="collapse"\r
    ng-ref-read="ngbCollapse">\r
    <div class="card">\r
        <div class="card-body">\r
            Both buttons control this panel. One calls the controller and the other changes the bound value.\r
        </div>\r
    </div>\r
</div>\r
`,o=`<button\r
    type="button"\r
    class="btn btn-primary mb-3"\r
    ng-click="example.toggle()"\r
    ng-attr-aria-expanded="{{ !example.collapsed }}"\r
    aria-controls="horizontal-collapse-panel">\r
    Toggle width\r
</button>\r
\r
<div class="d-flex">\r
    <div\r
        id="horizontal-collapse-panel"\r
        ngb-collapse="example.collapsed"\r
        horizontal="true">\r
        <div class="card card-body text-nowrap">\r
            This content collapses horizontally.\r
        </div>\r
    </div>\r
</div>\r
`,s=`<p class="text-body-secondary mb-3">\r
    Resize the viewport to see the navigation switch between its expanded and collapsed layouts.\r
</p>\r
\r
<nav class="navbar navbar-expand-lg bg-body-tertiary border rounded">\r
    <div class="container-fluid">\r
        <span class="navbar-brand mb-0">NgbJS</span>\r
\r
        <button\r
            type="button"\r
            class="navbar-toggler"\r
            ng-click="example.toggleMenu()"\r
            ng-attr-aria-expanded="{{ !example.menuCollapsed }}"\r
            aria-controls="collapse-navbar-menu"\r
            aria-label="Toggle navigation">\r
            <span class="navbar-toggler-icon"></span>\r
        </button>\r
\r
        <div\r
            id="collapse-navbar-menu"\r
            class="navbar-collapse"\r
            ngb-collapse="example.menuCollapsed">\r
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">\r
                <li class="nav-item">\r
                    <button type="button" class="nav-link active" ng-click="example.closeMenu()">Features</button>\r
                </li>\r
                <li class="nav-item">\r
                    <button type="button" class="nav-link" ng-click="example.closeMenu()">Examples</button>\r
                </li>\r
                <li class="nav-item">\r
                    <button type="button" class="nav-link" ng-click="example.closeMenu()">About</button>\r
                </li>\r
            </ul>\r
        </div>\r
    </div>\r
</nav>\r
`,c=class{examples={simple:{html:a,typescript:i},horizontal:{html:o,typescript:n},navbar:{html:s,typescript:r}}};c=t([e({selector:`docs-collapse-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/collapse-examples-page.component-d6faf99f.html`,styleUrl:`./collapse-examples-page.component.css`})],c);export{c as CollapseExamplesPageComponent};