import { Component } from "ngjs-core";
const horizontalCollapseTs = "import { Component } from \"ngjs-core\";\n\n@Component({\n    selector: \"docs-horizontal-collapse\",\n    controllerAs: \"example\",\n    templateUrl: \"horizontal-collapse.component.html\",\n    styleUrl: \"./horizontal-collapse.component.css\",\n})\nexport class HorizontalCollapseComponent {\n    public collapsed = true;\n\n    public toggle() {\n        this.collapsed = !this.collapsed;\n    }\n}\n";
const navbarCollapseTs = "import { Component } from \"ngjs-core\";\n\n@Component({\n    selector: \"docs-navbar-collapse\",\n    controllerAs: \"example\",\n    templateUrl: \"navbar-collapse.component.html\",\n    styleUrl: \"./navbar-collapse.component.css\",\n})\nexport class NavbarCollapseComponent {\n    public menuCollapsed = true;\n\n    public toggleMenu() {\n        this.menuCollapsed = !this.menuCollapsed;\n    }\n\n    public closeMenu() {\n        this.menuCollapsed = true;\n    }\n}\n";
const simpleCollapseTs = "import type { INgbCollapse } from \"ngb-js/collapse\";\nimport { Component, ViewChild } from \"ngjs-core\";\n\n@Component({\n    selector: \"docs-simple-collapse\",\n    controllerAs: \"example\",\n    templateUrl: \"simple-collapse.component.html\",\n    styleUrl: \"./simple-collapse.component.css\",\n})\nexport class SimpleCollapseComponent {\n    @ViewChild(\"collapse\", { static: true })\n    private collapse!: INgbCollapse;\n\n    public collapsed = true;\n\n    public toggleWithController() {\n        this.collapse.toggle();\n    }\n\n    public toggleWithBinding() {\n        this.collapsed = !this.collapsed;\n    }\n}\n";
const simpleCollapseHtml = "<div class=\"d-flex flex-wrap gap-2 mb-3\">\n    <button\n        type=\"button\"\n        class=\"btn btn-primary\"\n        ng-click=\"example.toggleWithController()\"\n        ng-attr-aria-expanded=\"{{ !example.collapsed }}\"\n        aria-controls=\"simple-collapse-panel\">\n        Toggle with controller\n    </button>\n\n    <button\n        type=\"button\"\n        class=\"btn btn-outline-primary\"\n        ng-click=\"example.toggleWithBinding()\"\n        ng-attr-aria-expanded=\"{{ !example.collapsed }}\"\n        aria-controls=\"simple-collapse-panel\">\n        Toggle with two-way binding\n    </button>\n</div>\n\n<div\n    id=\"simple-collapse-panel\"\n    ngb-collapse=\"example.collapsed\"\n    ngb-collapse-change=\"example.collapsed = $event\"\n    ng-ref=\"collapse\"\n    ng-ref-read=\"ngbCollapse\">\n    <div class=\"card\">\n        <div class=\"card-body\">\n            Both buttons control this panel. One calls the controller and the other changes the bound value.\n        </div>\n    </div>\n</div>\n";
const horizontalCollapseHtml = "<button\n    type=\"button\"\n    class=\"btn btn-primary mb-3\"\n    ng-click=\"example.toggle()\"\n    ng-attr-aria-expanded=\"{{ !example.collapsed }}\"\n    aria-controls=\"horizontal-collapse-panel\">\n    Toggle width\n</button>\n\n<div class=\"d-flex\">\n    <div\n        id=\"horizontal-collapse-panel\"\n        ngb-collapse=\"example.collapsed\"\n        horizontal=\"true\">\n        <div class=\"card card-body text-nowrap\">\n            This content collapses horizontally.\n        </div>\n    </div>\n</div>\n";
const navbarCollapseHtml = "<p class=\"text-body-secondary mb-3\">\n    Resize the viewport to see the navigation switch between its expanded and collapsed layouts.\n</p>\n\n<nav class=\"navbar navbar-expand-lg bg-body-tertiary border rounded\">\n    <div class=\"container-fluid\">\n        <span class=\"navbar-brand mb-0\">NgbJS</span>\n\n        <button\n            type=\"button\"\n            class=\"navbar-toggler\"\n            ng-click=\"example.toggleMenu()\"\n            ng-attr-aria-expanded=\"{{ !example.menuCollapsed }}\"\n            aria-controls=\"collapse-navbar-menu\"\n            aria-label=\"Toggle navigation\">\n            <span class=\"navbar-toggler-icon\"></span>\n        </button>\n\n        <div\n            id=\"collapse-navbar-menu\"\n            class=\"navbar-collapse\"\n            ngb-collapse=\"example.menuCollapsed\">\n            <ul class=\"navbar-nav me-auto mb-2 mb-lg-0\">\n                <li class=\"nav-item\">\n                    <button type=\"button\" class=\"nav-link active\" ng-click=\"example.closeMenu()\">Features</button>\n                </li>\n                <li class=\"nav-item\">\n                    <button type=\"button\" class=\"nav-link\" ng-click=\"example.closeMenu()\">Examples</button>\n                </li>\n                <li class=\"nav-item\">\n                    <button type=\"button\" class=\"nav-link\" ng-click=\"example.closeMenu()\">About</button>\n                </li>\n            </ul>\n        </div>\n    </div>\n</nav>\n";

@Component({
    selector: "docs-collapse-examples-page",
    controllerAs: "$",
    templateUrl: "collapse-examples-page.component.html",
    styleUrl: "./collapse-examples-page.component.css",
})
export class CollapseExamplesPageComponent {
    public readonly examples = {
        simple: {
            html: simpleCollapseHtml,
            typescript: simpleCollapseTs,
        },
        horizontal: {
            html: horizontalCollapseHtml,
            typescript: horizontalCollapseTs,
        },
        navbar: {
            html: navbarCollapseHtml,
            typescript: navbarCollapseTs,
        },
    }
}
