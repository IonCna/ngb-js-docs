import{r as e,t}from"./decorate-DwQZkZoC.js";var n=`<nav
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    class="nav-tabs">
    <div ngb-nav-item="'alternative-home'">
        <button type="button" ngb-nav-link>Button link</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">This item uses a button without list markup.</p>
        </ng-template>
    </div>
    <div ngb-nav-item="'alternative-profile'">
        <a ngb-nav-link>Anchor link</a>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">This item uses an anchor inside a plain div.</p>
        </ng-template>
    </div>
    <div ngb-nav-item="'alternative-contact'">
        <button type="button" ngb-nav-link>Another button</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">Buttons and anchors can be interchanged.</p>
        </ng-template>
    </div>
</nav>

<div ngb-nav-outlet="example.nav"></div>
`,r=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-alternative-nav",
    controllerAs: "example",
    templateUrl: "./alternative-nav.component.html",
    styleUrl: "./alternative-nav.component.css",
})
export class AlternativeNavComponent {
    public activeId = "alternative-home";
}
`,i=`.nav-demo { gap: .35rem; padding: .4rem; border: 1px solid var(--bs-border-color); border-radius: 999px; background: color-mix(in srgb, var(--bs-tertiary-bg) 82%, var(--bs-body-bg)); box-shadow: inset 0 1px 0 rgba(255, 255, 255, .05); }\r
.nav-demo .nav-link { border-radius: 999px; color: var(--bs-secondary-color); }\r
.nav-demo .nav-link:hover { color: var(--bs-emphasis-color); background: var(--bs-body-bg); }\r
.nav-demo .nav-link.active { color: var(--bs-primary-text-emphasis); background: var(--bs-primary-bg-subtle); box-shadow: 0 .35rem 1rem rgba(var(--bs-body-color-rgb), .08); }\r
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
`,o=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-custom-nav",
    controllerAs: "example",
    templateUrl: "./custom-nav.component.html",
    styleUrl: "./custom-nav.component.css",
})
export class CustomNavComponent {
    public activeId = "custom-weekly";
}
`,s=`<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.add()">Add tab</button>
    <button
        type="button"
        class="btn btn-outline-danger btn-sm"
        ng-click="example.removeActive()"
        ng-disabled="example.items.length === 1">
        Remove active tab
    </button>
</div>

<ul
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    class="nav-tabs">
    <li ng-repeat="item in example.items track by item.id" ngb-nav-item="item.id">
        <button type="button" ngb-nav-link>{{ item.title }}</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">Dynamic content for {{ item.title }}.</p>
        </ng-template>
    </li>
</ul>

<div ngb-nav-outlet="example.nav"></div>
`,c=`import { Component } from "ngjs-core";

interface DynamicNavItem {
    id: string;
    title: string;
}

@Component({
    selector: "docs-dynamic-nav",
    controllerAs: "example",
    templateUrl: "./dynamic-nav.component.html",
    styleUrl: "./dynamic-nav.component.css",
})
export class DynamicNavComponent {
    public items: DynamicNavItem[] = [
        { id: "dynamic-1", title: "Tab 1" },
        { id: "dynamic-2", title: "Tab 2" },
        { id: "dynamic-3", title: "Tab 3" },
    ];
    public activeId = "dynamic-1";
    private nextId = 4;

    public add() {
        const item = {
            id: \`dynamic-\${this.nextId}\`,
            title: \`Tab \${this.nextId}\`,
        };

        this.nextId++;
        this.items.push(item);
        this.activeId = item.id;
    }

    public removeActive() {
        if (this.items.length === 1) return;

        const activeIndex = this.items.findIndex(({ id }) => id === this.activeId);
        const replacement = this.items[activeIndex === 0 ? 1 : activeIndex - 1];

        this.activeId = replacement.id;
        this.items = this.items.filter(({ id }) => id !== this.items[activeIndex].id);
    }
}
`,l=`<ul
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    destroy-on-hide="false"
    class="nav-tabs">
    <li ngb-nav-item="'keep-editor'">
        <button type="button" ngb-nav-link>Editor</button>
        <ng-template ngb-nav-content>
            <div class="pt-3">
                <label class="form-label" for="keep-content-draft">Draft</label>
                <input id="keep-content-draft" type="text" class="form-control" ng-model="example.draft">
            </div>
        </ng-template>
    </li>
    <li ngb-nav-item="'keep-preview'">
        <button type="button" ngb-nav-link>Preview</button>
        <ng-template ngb-nav-content>
            <div class="pt-3">
                <p class="small text-body-secondary mb-1">Current draft</p>
                <p class="mb-0">{{ example.draft }}</p>
            </div>
        </ng-template>
    </li>
</ul>

<div ngb-nav-outlet="example.nav"></div>
`,u=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-keep-content-nav",
    controllerAs: "example",
    templateUrl: "./keep-content-nav.component.html",
    styleUrl: "./keep-content-nav.component.css",
})
export class KeepContentNavComponent {
    public activeId = "keep-editor";
    public draft = "This value survives tab changes.";
}
`,d=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            The nav is vertical, keeps hidden content and selects tabs while navigating with the arrow keys.
        </p>
    </div>
</div>

<div class="d-flex align-items-start gap-3">
    <div
        ngb-nav
        ng-ref="example.nav"
        ng-ref-read="ngbNav"
        active-id="example.activeId"
        class="nav-pills flex-column flex-shrink-0">
        <div ngb-nav-item="'global-account'">
            <button type="button" ngb-nav-link>Account</button>
            <ng-template ngb-nav-content><p class="mb-0">Global account settings.</p></ng-template>
        </div>
        <div ngb-nav-item="'global-team'">
            <button type="button" ngb-nav-link>Team</button>
            <ng-template ngb-nav-content><p class="mb-0">Global team settings.</p></ng-template>
        </div>
        <div ngb-nav-item="'global-billing'">
            <button type="button" ngb-nav-link>Billing</button>
            <ng-template ngb-nav-content><p class="mb-0">Global billing settings.</p></ng-template>
        </div>
    </div>

    <div class="border rounded p-3 flex-grow-1" ngb-nav-outlet="example.nav"></div>
</div>
`,f=`import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbNavConfig, NGB_NAV_CONFIG } from "ngb-js/nav";

@Component({
    selector: "docs-nav-global",
    controllerAs: "example",
    templateUrl: "./nav-global.component.html",
    styleUrl: "./nav-global.component.css",
})
export class NavGlobalComponent implements AfterViewInit, OnDestroy {
    public activeId = "global-account";

    private readonly initialConfig: Pick<
        NgbNavConfig,
        "animation" | "destroyOnHide" | "keyboard" | "orientation" | "roles"
    >;

    constructor(@Inject(NGB_NAV_CONFIG) private readonly config: NgbNavConfig) {
        this.initialConfig = {
            animation: config.animation,
            destroyOnHide: config.destroyOnHide,
            keyboard: config.keyboard,
            orientation: config.orientation,
            roles: config.roles,
        };

        config.animation = false;
        config.destroyOnHide = false;
        config.keyboard = "changeWithArrows";
        config.orientation = "vertical";
        config.roles = "tablist";
    }

    public ngAfterViewInit() {
        this.restoreConfig();
    }

    public ngOnDestroy() {
        this.restoreConfig();
    }

    private restoreConfig() {
        this.config.animation = this.initialConfig.animation;
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;
        this.config.keyboard = this.initialConfig.keyboard;
        this.config.orientation = this.initialConfig.orientation;
        this.config.roles = this.initialConfig.roles;
    }
}
`,p=`<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-first')">
        Select first
    </button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-second')">
        Select second
    </button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.select('selecting-third')">
        Select third
    </button>
</div>

<ul ngb-nav ng-ref="example.nav" ng-ref-read="ngbNav" active-id="example.activeId" class="nav-tabs">
    <li ngb-nav-item="'selecting-first'">
        <button type="button" ngb-nav-link>First</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">First tab selected.</p></ng-template>
    </li>
    <li ngb-nav-item="'selecting-second'">
        <button type="button" ngb-nav-link>Second</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Second tab selected.</p></ng-template>
    </li>
    <li ngb-nav-item="'selecting-third'">
        <button type="button" ngb-nav-link>Third</button>
        <ng-template ngb-nav-content><p class="pt-3 mb-0">Third tab selected.</p></ng-template>
    </li>
</ul>

<div ngb-nav-outlet="example.nav"></div>
<p class="small text-body-secondary mt-2 mb-0">Active id: {{ example.activeId }}</p>
`,m=`import { Component } from "ngjs-core";
import { NgbNav } from "ngb-js/nav";

@Component({
    selector: "docs-selecting-nav",
    controllerAs: "example",
    templateUrl: "./selecting-nav.component.html",
    styleUrl: "./selecting-nav.component.css",
})
export class SelectingNavComponent {
    public nav!: NgbNav;

    public activeId = "selecting-first";

    public select(id: string) {
        this.nav.select(id);
    }
}
`,h=`<ul
    ngb-nav
    ng-ref="example.nav"
    ng-ref-read="ngbNav"
    active-id="example.activeId"
    class="nav-tabs">
    <li ngb-nav-item="'simple-overview'">
        <button type="button" ngb-nav-link>Overview</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">A concise overview of the current project.</p>
        </ng-template>
    </li>
    <li ngb-nav-item="'simple-features'">
        <button type="button" ngb-nav-link>Features</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">Explore the features exposed by this library.</p>
        </ng-template>
    </li>
    <li ngb-nav-item="'simple-settings'">
        <button type="button" ngb-nav-link>Settings</button>
        <ng-template ngb-nav-content>
            <p class="pt-3 mb-0">Adjust the settings for this example.</p>
        </ng-template>
    </li>
</ul>

<div ngb-nav-outlet="example.nav"></div>
`,g=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-simple-nav",
    controllerAs: "example",
    templateUrl: "./simple-nav.component.html",
    styleUrl: "./simple-nav.component.css",
})
export class SimpleNavComponent {
    public activeId = "simple-overview";
}
`,_=`<div class="d-flex align-items-start gap-3">
    <div
        ngb-nav
        ng-ref="example.nav"
        ng-ref-read="ngbNav"
        active-id="example.activeId"
        orientation="'vertical'"
        class="nav-pills flex-shrink-0">
        <div ngb-nav-item="'vertical-profile'">
            <button type="button" ngb-nav-link>Profile</button>
            <ng-template ngb-nav-content>
                <h3 class="h5">Profile</h3>
                <p class="mb-0">Manage your public information and preferences.</p>
            </ng-template>
        </div>
        <div ngb-nav-item="'vertical-security'">
            <button type="button" ngb-nav-link>Security</button>
            <ng-template ngb-nav-content>
                <h3 class="h5">Security</h3>
                <p class="mb-0">Review sessions, passwords and account access.</p>
            </ng-template>
        </div>
        <div ngb-nav-item="'vertical-notifications'">
            <button type="button" ngb-nav-link>Notifications</button>
            <ng-template ngb-nav-content>
                <h3 class="h5">Notifications</h3>
                <p class="mb-0">Choose when and how the application contacts you.</p>
            </ng-template>
        </div>
    </div>

    <div class="border rounded p-3 flex-grow-1" ngb-nav-outlet="example.nav"></div>
</div>
`,v=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-vertical-nav",
    controllerAs: "example",
    templateUrl: "./vertical-nav.component.html",
    styleUrl: "./vertical-nav.component.css",
})
export class VerticalNavComponent {
    public activeId = "vertical-profile";
}
`,y=class{examples={simple:{html:h,typescript:g},alternative:{html:n,typescript:r},vertical:{html:_,typescript:v},selecting:{html:p,typescript:m},keepContent:{html:l,typescript:u},dynamic:{html:s,typescript:c},custom:{html:a,typescript:o,css:i},global:{html:d,typescript:f}}};y=t([e({selector:`docs-nav-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/nav-examples-page.component-a38be803.html`,styleUrl:`./nav-examples-page.component.css`})],y);export{y as NavExamplesPageComponent};