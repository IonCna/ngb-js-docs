import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`<nav\r
    ngb-nav\r
    ng-ref="example.nav"\r
    ng-ref-read="ngbNav"\r
    active-id="example.activeId"\r
    class="nav-tabs">\r
    <div ngb-nav-item="'alternative-home'">\r
        <button type="button" ngb-nav-link>Button link</button>\r
        <ng-template ngb-nav-content>\r
            <p class="pt-3 mb-0">This item uses a button without list markup.</p>\r
        </ng-template>\r
    </div>\r
    <div ngb-nav-item="'alternative-profile'">\r
        <a ngb-nav-link>Anchor link</a>\r
        <ng-template ngb-nav-content>\r
            <p class="pt-3 mb-0">This item uses an anchor inside a plain div.</p>\r
        </ng-template>\r
    </div>\r
    <div ngb-nav-item="'alternative-contact'">\r
        <button type="button" ngb-nav-link>Another button</button>\r
        <ng-template ngb-nav-content>\r
            <p class="pt-3 mb-0">Buttons and anchors can be interchanged.</p>\r
        </ng-template>\r
    </div>\r
</nav>\r
\r
<div ngb-nav-outlet="example.nav"></div>\r
`,r=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-alternative-nav",\r
    controllerAs: "example",\r
    templateUrl: "./alternative-nav.component.html",\r
    styleUrl: "./alternative-nav.component.css",\r
})\r
export class AlternativeNavComponent {\r
    public activeId = "alternative-home";\r
}\r
`,i=`.nav-demo { gap: .35rem; padding: .4rem; border: 1px solid var(--bs-border-color); border-radius: 999px; background: color-mix(in srgb, var(--bs-tertiary-bg) 82%, var(--bs-body-bg)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05); }
.nav-demo .nav-link { border-radius: 999px; color: var(--bs-secondary-color); }
.nav-demo .nav-link:hover { color: var(--bs-emphasis-color); background: var(--bs-body-bg); }
.nav-demo .nav-link.active { color: var(--bs-primary-text-emphasis); background: var(--bs-primary-bg-subtle); box-shadow: 0 .35rem 1rem rgba(var(--bs-body-color-rgb), .08); }
`,a=`<div\r
    ngb-nav\r
    ng-ref="example.nav"\r
    ng-ref-read="ngbNav"\r
    active-id="example.activeId"\r
    roles="false"\r
    class="nav-demo">\r
    <div ngb-nav-item="'custom-daily'">\r
        <button type="button" ngb-nav-link>Daily</button>\r
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Daily activity summary.</p></ng-template>\r
    </div>\r
    <div ngb-nav-item="'custom-weekly'">\r
        <button type="button" ngb-nav-link>Weekly</button>\r
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Weekly activity summary.</p></ng-template>\r
    </div>\r
    <div ngb-nav-item="'custom-monthly'">\r
        <button type="button" ngb-nav-link>Monthly</button>\r
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Monthly activity summary.</p></ng-template>\r
    </div>\r
</div>\r
\r
<div ngb-nav-outlet="example.nav"></div>\r
`,o=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-custom-nav",\r
    controllerAs: "example",\r
    templateUrl: "./custom-nav.component.html",\r
    styleUrl: "./custom-nav.component.css",\r
})\r
export class CustomNavComponent {\r
    public activeId = "custom-weekly";\r
}\r
`,s=`<div class="d-flex flex-wrap gap-2 mb-3">\r
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.add()">Add tab</button>\r
    <button\r
        type="button"\r
        class="btn btn-outline-danger btn-sm"\r
        ng-click="example.removeActive()"\r
        ng-disabled="example.items.length === 1">\r
        Remove active tab\r
    </button>\r
</div>\r
\r
<ul\r
    ngb-nav\r
    ng-ref="example.nav"\r
    ng-ref-read="ngbNav"\r
    active-id="example.activeId"\r
    class="nav-tabs">\r
    <li ng-repeat="item in example.items track by item.id" ngb-nav-item="item.id">\r
        <button type="button" ngb-nav-link>{{ item.title }}</button>\r
        <ng-template ngb-nav-content>\r
            <p class="pt-3 mb-0">Dynamic content for {{ item.title }}.</p>\r
        </ng-template>\r
    </li>\r
</ul>\r
\r
<div ngb-nav-outlet="example.nav"></div>\r
`,c=`import { Component } from "ngjs-core";\r
\r
interface DynamicNavItem {\r
    id: string;\r
    title: string;\r
}\r
\r
@Component({\r
    selector: "docs-dynamic-nav",\r
    controllerAs: "example",\r
    templateUrl: "./dynamic-nav.component.html",\r
    styleUrl: "./dynamic-nav.component.css",\r
})\r
export class DynamicNavComponent {\r
    public items: DynamicNavItem[] = [\r
        { id: "dynamic-1", title: "Tab 1" },\r
        { id: "dynamic-2", title: "Tab 2" },\r
        { id: "dynamic-3", title: "Tab 3" },\r
    ];\r
    public activeId = "dynamic-1";\r
    private nextId = 4;\r
\r
    public add() {\r
        const item = {\r
            id: \`dynamic-\${this.nextId}\`,\r
            title: \`Tab \${this.nextId}\`,\r
        };\r
\r
        this.nextId++;\r
        this.items.push(item);\r
        this.activeId = item.id;\r
    }\r
\r
    public removeActive() {\r
        if (this.items.length === 1) return;\r
\r
        const activeIndex = this.items.findIndex(({ id }) => id === this.activeId);\r
        const replacement = this.items[activeIndex === 0 ? 1 : activeIndex - 1];\r
\r
        this.activeId = replacement.id;\r
        this.items = this.items.filter(({ id }) => id !== this.items[activeIndex].id);\r
    }\r
}\r
`,l=`<ul\r
    ngb-nav\r
    ng-ref="example.nav"\r
    ng-ref-read="ngbNav"\r
    active-id="example.activeId"\r
    destroy-on-hide="false"\r
    class="nav-tabs">\r
    <li ngb-nav-item="'keep-editor'">\r
        <button type="button" ngb-nav-link>Editor</button>\r
        <ng-template ngb-nav-content>\r
            <div class="pt-3">\r
                <label class="form-label" for="keep-content-draft">Draft</label>\r
                <input id="keep-content-draft" type="text" class="form-control" ng-model="example.draft">\r
            </div>\r
        </ng-template>\r
    </li>\r
    <li ngb-nav-item="'keep-preview'">\r
        <button type="button" ngb-nav-link>Preview</button>\r
        <ng-template ngb-nav-content>\r
            <div class="pt-3">\r
                <p class="small text-body-secondary mb-1">Current draft</p>\r
                <p class="mb-0">{{ example.draft }}</p>\r
            </div>\r
        </ng-template>\r
    </li>\r
</ul>\r
\r
<div ngb-nav-outlet="example.nav"></div>\r
`,u=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-keep-content-nav",\r
    controllerAs: "example",\r
    templateUrl: "./keep-content-nav.component.html",\r
    styleUrl: "./keep-content-nav.component.css",\r
})\r
export class KeepContentNavComponent {\r
    public activeId = "keep-editor";\r
    public draft = "This value survives tab changes.";\r
}\r
`,d=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            The nav is vertical, keeps hidden content and selects tabs while navigating with the arrow keys.\r
        </p>\r
    </div>\r
</div>\r
\r
<div class="d-flex align-items-start gap-3">\r
    <div\r
        ngb-nav\r
        ng-ref="example.nav"\r
        ng-ref-read="ngbNav"\r
        active-id="example.activeId"\r
        class="nav-pills flex-column flex-shrink-0">\r
        <div ngb-nav-item="'global-account'">\r
            <button type="button" ngb-nav-link>Account</button>\r
            <ng-template ngb-nav-content><p class="mb-0">Global account settings.</p></ng-template>\r
        </div>\r
        <div ngb-nav-item="'global-team'">\r
            <button type="button" ngb-nav-link>Team</button>\r
            <ng-template ngb-nav-content><p class="mb-0">Global team settings.</p></ng-template>\r
        </div>\r
        <div ngb-nav-item="'global-billing'">\r
            <button type="button" ngb-nav-link>Billing</button>\r
            <ng-template ngb-nav-content><p class="mb-0">Global billing settings.</p></ng-template>\r
        </div>\r
    </div>\r
\r
    <div class="border rounded p-3 flex-grow-1" ngb-nav-outlet="example.nav"></div>\r
</div>\r
`,f=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";\r
import { NgbNavConfig, NGB_NAV_CONFIG } from "ngb-js/nav";\r
\r
@Component({\r
    selector: "docs-nav-global",\r
    controllerAs: "example",\r
    templateUrl: "./nav-global.component.html",\r
    styleUrl: "./nav-global.component.css",\r
})\r
export class NavGlobalComponent implements AfterViewInit, OnDestroy {\r
    public activeId = "global-account";\r
\r
    private readonly initialConfig: Pick<\r
        NgbNavConfig,\r
        "animation" | "destroyOnHide" | "keyboard" | "orientation" | "roles"\r
    >;\r
\r
    constructor(@Inject(NGB_NAV_CONFIG) private readonly config: NgbNavConfig) {\r
        this.initialConfig = {\r
            animation: config.animation,\r
            destroyOnHide: config.destroyOnHide,\r
            keyboard: config.keyboard,\r
            orientation: config.orientation,\r
            roles: config.roles,\r
        };\r
\r
        config.animation = false;\r
        config.destroyOnHide = false;\r
        config.keyboard = "changeWithArrows";\r
        config.orientation = "vertical";\r
        config.roles = "tablist";\r
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
        this.config.animation = this.initialConfig.animation;\r
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;\r
        this.config.keyboard = this.initialConfig.keyboard;\r
        this.config.orientation = this.initialConfig.orientation;\r
        this.config.roles = this.initialConfig.roles;\r
    }\r
}\r
`,p=`<div class="d-flex flex-wrap gap-2 mb-3">\r
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-first')">\r
        Select first\r
    </button>\r
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-second')">\r
        Select second\r
    </button>\r
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-third')">\r
        Select third\r
    </button>\r
</div>\r
\r
<ul ngb-nav ng-ref="example.nav" ng-ref-read="ngbNav" active-id="example.activeId" class="nav-tabs">\r
    <li ngb-nav-item="'selecting-first'">\r
        <button type="button" ngb-nav-link>First</button>\r
        <ng-template ngb-nav-content><p class="pt-3 mb-0">First tab selected.</p></ng-template>\r
    </li>\r
    <li ngb-nav-item="'selecting-second'">\r
        <button type="button" ngb-nav-link>Second</button>\r
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Second tab selected.</p></ng-template>\r
    </li>\r
    <li ngb-nav-item="'selecting-third'">\r
        <button type="button" ngb-nav-link>Third</button>\r
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Third tab selected.</p></ng-template>\r
    </li>\r
</ul>\r
\r
<div ngb-nav-outlet="example.nav"></div>\r
<p class="small text-body-secondary mt-2 mb-0">Active id: {{ example.activeId }}</p>\r
`,m=`import { Component } from "ngjs-core";\r
import { NgbNav } from "ngb-js/nav";\r
\r
@Component({\r
    selector: "docs-selecting-nav",\r
    controllerAs: "example",\r
    templateUrl: "./selecting-nav.component.html",\r
    styleUrl: "./selecting-nav.component.css",\r
})\r
export class SelectingNavComponent {\r
    public nav!: NgbNav;\r
\r
    public activeId = "selecting-first";\r
\r
    public select(id: string) {\r
        this.nav.select(id);\r
    }\r
}\r
`,h=`<ul\r
    ngb-nav\r
    ng-ref="example.nav"\r
    ng-ref-read="ngbNav"\r
    active-id="example.activeId"\r
    class="nav-tabs">\r
    <li ngb-nav-item="'simple-overview'">\r
        <button type="button" ngb-nav-link>Overview</button>\r
        <ng-template ngb-nav-content>\r
            <p class="pt-3 mb-0">A concise overview of the current project.</p>\r
        </ng-template>\r
    </li>\r
    <li ngb-nav-item="'simple-features'">\r
        <button type="button" ngb-nav-link>Features</button>\r
        <ng-template ngb-nav-content>\r
            <p class="pt-3 mb-0">Explore the features exposed by this library.</p>\r
        </ng-template>\r
    </li>\r
    <li ngb-nav-item="'simple-settings'">\r
        <button type="button" ngb-nav-link>Settings</button>\r
        <ng-template ngb-nav-content>\r
            <p class="pt-3 mb-0">Adjust the settings for this example.</p>\r
        </ng-template>\r
    </li>\r
</ul>\r
\r
<div ngb-nav-outlet="example.nav"></div>\r
`,g=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-simple-nav",\r
    controllerAs: "example",\r
    templateUrl: "./simple-nav.component.html",\r
    styleUrl: "./simple-nav.component.css",\r
})\r
export class SimpleNavComponent {\r
    public activeId = "simple-overview";\r
}\r
`,_=`<div class="d-flex align-items-start gap-3">\r
    <div\r
        ngb-nav\r
        ng-ref="example.nav"\r
        ng-ref-read="ngbNav"\r
        active-id="example.activeId"\r
        orientation="'vertical'"\r
        class="nav-pills flex-shrink-0">\r
        <div ngb-nav-item="'vertical-profile'">\r
            <button type="button" ngb-nav-link>Profile</button>\r
            <ng-template ngb-nav-content>\r
                <h3 class="h5">Profile</h3>\r
                <p class="mb-0">Manage your public information and preferences.</p>\r
            </ng-template>\r
        </div>\r
        <div ngb-nav-item="'vertical-security'">\r
            <button type="button" ngb-nav-link>Security</button>\r
            <ng-template ngb-nav-content>\r
                <h3 class="h5">Security</h3>\r
                <p class="mb-0">Review sessions, passwords and account access.</p>\r
            </ng-template>\r
        </div>\r
        <div ngb-nav-item="'vertical-notifications'">\r
            <button type="button" ngb-nav-link>Notifications</button>\r
            <ng-template ngb-nav-content>\r
                <h3 class="h5">Notifications</h3>\r
                <p class="mb-0">Choose when and how the application contacts you.</p>\r
            </ng-template>\r
        </div>\r
    </div>\r
\r
    <div class="border rounded p-3 flex-grow-1" ngb-nav-outlet="example.nav"></div>\r
</div>\r
`,v=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-vertical-nav",\r
    controllerAs: "example",\r
    templateUrl: "./vertical-nav.component.html",\r
    styleUrl: "./vertical-nav.component.css",\r
})\r
export class VerticalNavComponent {\r
    public activeId = "vertical-profile";\r
}\r
`,y=class{examples={simple:{html:h,typescript:g},alternative:{html:n,typescript:r},vertical:{html:_,typescript:v},selecting:{html:p,typescript:m},keepContent:{html:l,typescript:u},dynamic:{html:s,typescript:c},custom:{html:a,typescript:o,css:i},global:{html:d,typescript:f}}};y=t([e({selector:`docs-nav-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/nav-examples-page.component-ce184797.html`,styleUrl:`./nav-examples-page.component.css`})],y);export{y as NavExamplesPageComponent};