import{d as e,f as t}from"./index-B9XAkpig.js";var n=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-dropdown-disabled-items",
    controllerAs: "example",
    templateUrl: "./dropdown-disabled-items.component.html",
    styleUrl: "./dropdown-disabled-items.component.css",
})
export class DropdownDisabledItemsComponent {
    public restricted = true;
}
`,r=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-dropdown-form",
    controllerAs: "example",
    templateUrl: "./dropdown-form.component.html",
    styleUrl: "./dropdown-form.component.css",
})
export class DropdownFormComponent {
    public email = "";
    public remember = false;
    public submitted = false;

    public submit() {
        this.submitted = true;
    }
}
`,i=`import { Component, Inject, type OnDestroy } from "ngjs-core";
import { NgbDropdownConfig, NGB_DROPDOWN_CONFIG } from "ngb-js/dropdown";

@Component({
    selector: "docs-dropdown-global",
    controllerAs: "example",
    templateUrl: "./dropdown-global.component.html",
    styleUrl: "./dropdown-global.component.css",
})
export class DropdownGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbDropdownConfig, "autoClose" | "container" | "placement">;

    constructor(@Inject(NGB_DROPDOWN_CONFIG) private readonly config: NgbDropdownConfig) {
        this.initialConfig = {
            autoClose: config.autoClose,
            container: config.container,
            placement: config.placement,
        };

        config.autoClose = "outside";
        config.container = "body";
        config.placement = ["top-start", "bottom-start"];
    }

    public ngOnDestroy() {
        this.config.autoClose = this.initialConfig.autoClose;
        this.config.container = this.initialConfig.container;
        this.config.placement = this.initialConfig.placement;
    }
}
`,a=`import { Component, ViewChild } from "ngjs-core";
import { NgbDropdown } from "ngb-js/dropdown/compat";

@Component({
    selector: "docs-manual-dropdown",
    controllerAs: "example",
    templateUrl: "./manual-dropdown.component.html",
    styleUrl: "./manual-dropdown.component.css",
})
export class ManualDropdownComponent {
    @ViewChild("dropdown", { read: NgbDropdown, static: true })
    private dropdown!: NgbDropdown;

    public opened = false;

    public open() {
        this.dropdown.open();
    }

    public close() {
        this.dropdown.close();
    }

    public toggle() {
        this.dropdown.toggle();
    }
}
`,o=`<div class="d-flex flex-wrap align-items-center gap-3 py-5">
    <div ngb-dropdown placement="'bottom-start'">
        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Bottom dropdown</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Profile</button>
            <button type="button" ngb-dropdown-item>Settings</button>
            <div class="dropdown-divider"></div>
            <button type="button" ngb-dropdown-item>Sign out</button>
        </div>
    </div>

    <div ngb-dropdown placement="'top-start'">
        <button type="button" class="btn btn-outline-primary" ngb-dropdown-toggle>Top dropdown</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Newest first</button>
            <button type="button" ngb-dropdown-item>Oldest first</button>
            <button type="button" ngb-dropdown-item>Recently updated</button>
        </div>
    </div>
</div>
`,s=`<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.open()">Open</button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.close()">Close</button>
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle()">Toggle</button>
</div>

<div
    ngb-dropdown
    ng-ref="dropdown"
    open="example.opened"
    open-change="example.opened = $event">
    <button type="button" class="btn btn-outline-dark" ngb-dropdown-anchor>
        Manually controlled menu
    </button>
    <div ngb-dropdown-menu>
        <button type="button" ngb-dropdown-item>First action</button>
        <button type="button" ngb-dropdown-item>Second action</button>
    </div>
</div>

<p class="small text-body-secondary mt-2 mb-0">
    Current state: {{ example.opened ? 'open' : 'closed' }}
</p>
`,c=`<div class="d-flex flex-wrap gap-3">
    <div class="btn-group" ngb-dropdown>
        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Button group</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Edit</button>
            <button type="button" ngb-dropdown-item>Duplicate</button>
            <button type="button" ngb-dropdown-item>Archive</button>
        </div>
    </div>

    <div class="btn-group" ngb-dropdown>
        <button type="button" class="btn btn-success">Save</button>
        <button
            type="button"
            class="btn btn-success dropdown-toggle-split"
            ngb-dropdown-toggle
            aria-label="More save options">
            <span class="visually-hidden">Toggle dropdown</span>
        </button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Save as draft</button>
            <button type="button" ngb-dropdown-item>Save and publish</button>
            <button type="button" ngb-dropdown-item>Save a copy</button>
        </div>
    </div>
</div>
`,l=`<div class="form-check form-switch mb-3">
    <input
        class="form-check-input"
        type="checkbox"
        role="switch"
        id="dropdown-restricted-items"
        ng-model="example.restricted">
    <label class="form-check-label" for="dropdown-restricted-items">Disable restricted actions</label>
</div>

<div ngb-dropdown>
    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Project actions</button>
    <div ngb-dropdown-menu>
        <button type="button" ngb-dropdown-item>Open project</button>
        <button type="button" ngb-dropdown-item ng-disabled="example.restricted">Archive project</button>
        <button type="button" ngb-dropdown-item ng-disabled="example.restricted">Delete project</button>
        <div class="dropdown-divider"></div>
        <button type="button" ngb-dropdown-item ng-disabled="true">Unavailable action</button>
    </div>
</div>
`,u=`<div ngb-dropdown auto-close="'outside'">
    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Sign in</button>
    <div ngb-dropdown-menu class="p-3">
        <form ng-submit="example.submit()">
            <div class="mb-3">
                <label class="form-label" for="dropdown-form-email">Email address</label>
                <input
                    id="dropdown-form-email"
                    type="email"
                    class="form-control"
                    placeholder="name@example.com"
                    ng-model="example.email"
                    required>
            </div>
            <div class="form-check mb-3">
                <input
                    id="dropdown-form-remember"
                    type="checkbox"
                    class="form-check-input"
                    ng-model="example.remember">
                <label class="form-check-label" for="dropdown-form-remember">Remember me</label>
            </div>
            <button type="submit" class="btn btn-primary w-100">Continue</button>
            <p class="small text-success mt-2 mb-0" ng-if="example.submitted">Form submitted.</p>
        </form>
    </div>
</div>
`,d=`<div class="border rounded p-3 overflow-hidden">
    <p class="small text-body-secondary mb-3">
        The wrapper clips overflowing content, but the menu is appended to the document body.
    </p>

    <div ngb-dropdown container="body">
        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Open body container</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Account</button>
            <button type="button" ngb-dropdown-item>Notifications</button>
            <button type="button" ngb-dropdown-item>Privacy</button>
        </div>
    </div>
</div>
`,f=`<nav class="navbar bg-body-tertiary border rounded px-3">
    <span class="navbar-brand mb-0">Workspace</span>

    <div class="ms-auto" ngb-dropdown display="dynamic" placement="'bottom-end'">
        <button type="button" class="btn btn-outline-primary" ngb-dropdown-toggle>Account</button>
        <div ngb-dropdown-menu>
            <button type="button" ngb-dropdown-item>Profile</button>
            <button type="button" ngb-dropdown-item>Preferences</button>
            <div class="dropdown-divider"></div>
            <button type="button" ngb-dropdown-item>Sign out</button>
        </div>
    </div>
</nav>
`,p=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            The menu prefers the top placement, uses the body container and closes only after an outside click.
        </p>
    </div>
</div>

<div ngb-dropdown>
    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Globally configured</button>
    <div ngb-dropdown-menu>
        <button type="button" ngb-dropdown-item>This click keeps the menu open</button>
        <button type="button" ngb-dropdown-item>So does this one</button>
    </div>
</div>
`,m=class{examples={simple:{html:o},manual:{html:s,typescript:a},buttonGroups:{html:c},disabledItems:{html:l,typescript:n},form:{html:u,typescript:r},body:{html:d},navbar:{html:f},global:{html:p,typescript:i}}};m=e([t({selector:`docs-dropdown-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/dropdown-examples-page.component-a0f8f18c.html`,styleUrl:`./dropdown-examples-page.component.css`})],m);export{m as DropdownExamplesPageComponent};