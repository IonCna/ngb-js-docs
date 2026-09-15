import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-dropdown-disabled-items",\r
    controllerAs: "example",\r
    templateUrl: "./dropdown-disabled-items.component.html",\r
    styleUrl: "./dropdown-disabled-items.component.css",\r
})\r
export class DropdownDisabledItemsComponent {\r
    public restricted = true;\r
}\r
`,r=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-dropdown-form",\r
    controllerAs: "example",\r
    templateUrl: "./dropdown-form.component.html",\r
    styleUrl: "./dropdown-form.component.css",\r
})\r
export class DropdownFormComponent {\r
    public email = "";\r
    public remember = false;\r
    public submitted = false;\r
\r
    public submit() {\r
        this.submitted = true;\r
    }\r
}\r
`,i=`import { Component, Inject, type OnDestroy } from "ngjs-core";\r
import { NgbDropdownConfig, NGB_DROPDOWN_CONFIG } from "ngb-js/dropdown";\r
\r
@Component({\r
    selector: "docs-dropdown-global",\r
    controllerAs: "example",\r
    templateUrl: "./dropdown-global.component.html",\r
    styleUrl: "./dropdown-global.component.css",\r
})\r
export class DropdownGlobalComponent implements OnDestroy {\r
    private readonly initialConfig: Pick<NgbDropdownConfig, "autoClose" | "container" | "placement">;\r
\r
    constructor(@Inject(NGB_DROPDOWN_CONFIG) private readonly config: NgbDropdownConfig) {\r
        this.initialConfig = {\r
            autoClose: config.autoClose,\r
            container: config.container,\r
            placement: config.placement,\r
        };\r
\r
        config.autoClose = "outside";\r
        config.container = "body";\r
        config.placement = ["top-start", "bottom-start"];\r
    }\r
\r
    public ngOnDestroy() {\r
        this.config.autoClose = this.initialConfig.autoClose;\r
        this.config.container = this.initialConfig.container;\r
        this.config.placement = this.initialConfig.placement;\r
    }\r
}\r
`,a=`import { Component, ViewChild } from "ngjs-core";\r
import { NgbDropdown } from "ngb-js/dropdown/compat";\r
\r
@Component({\r
    selector: "docs-manual-dropdown",\r
    controllerAs: "example",\r
    templateUrl: "./manual-dropdown.component.html",\r
    styleUrl: "./manual-dropdown.component.css",\r
})\r
export class ManualDropdownComponent {\r
    @ViewChild("dropdown", { read: NgbDropdown, static: true })\r
    private dropdown!: NgbDropdown;\r
\r
    public opened = false;\r
\r
    public open() {\r
        this.dropdown.open();\r
    }\r
\r
    public close() {\r
        this.dropdown.close();\r
    }\r
\r
    public toggle() {\r
        this.dropdown.toggle();\r
    }\r
}\r
`,o=`<div class="d-flex flex-wrap align-items-center gap-3 py-5">\r
    <div ngb-dropdown placement="'bottom-start'">\r
        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Bottom dropdown</button>\r
        <div ngb-dropdown-menu>\r
            <button type="button" ngb-dropdown-item>Profile</button>\r
            <button type="button" ngb-dropdown-item>Settings</button>\r
            <div class="dropdown-divider"></div>\r
            <button type="button" ngb-dropdown-item>Sign out</button>\r
        </div>\r
    </div>\r
\r
    <div ngb-dropdown placement="'top-start'">\r
        <button type="button" class="btn btn-outline-primary" ngb-dropdown-toggle>Top dropdown</button>\r
        <div ngb-dropdown-menu>\r
            <button type="button" ngb-dropdown-item>Newest first</button>\r
            <button type="button" ngb-dropdown-item>Oldest first</button>\r
            <button type="button" ngb-dropdown-item>Recently updated</button>\r
        </div>\r
    </div>\r
</div>\r
`,s=`<div class="d-flex flex-wrap gap-2 mb-3">\r
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.open()">Open</button>\r
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.close()">Close</button>\r
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle()">Toggle</button>\r
</div>\r
\r
<div\r
    ngb-dropdown\r
    ng-ref="dropdown"\r
    open="example.opened"\r
    open-change="example.opened = $event">\r
    <button type="button" class="btn btn-outline-dark" ngb-dropdown-anchor>\r
        Manually controlled menu\r
    </button>\r
    <div ngb-dropdown-menu>\r
        <button type="button" ngb-dropdown-item>First action</button>\r
        <button type="button" ngb-dropdown-item>Second action</button>\r
    </div>\r
</div>\r
\r
<p class="small text-body-secondary mt-2 mb-0">\r
    Current state: {{ example.opened ? 'open' : 'closed' }}\r
</p>\r
`,c=`<div class="d-flex flex-wrap gap-3">\r
    <div class="btn-group" ngb-dropdown>\r
        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Button group</button>\r
        <div ngb-dropdown-menu>\r
            <button type="button" ngb-dropdown-item>Edit</button>\r
            <button type="button" ngb-dropdown-item>Duplicate</button>\r
            <button type="button" ngb-dropdown-item>Archive</button>\r
        </div>\r
    </div>\r
\r
    <div class="btn-group" ngb-dropdown>\r
        <button type="button" class="btn btn-success">Save</button>\r
        <button\r
            type="button"\r
            class="btn btn-success dropdown-toggle-split"\r
            ngb-dropdown-toggle\r
            aria-label="More save options">\r
            <span class="visually-hidden">Toggle dropdown</span>\r
        </button>\r
        <div ngb-dropdown-menu>\r
            <button type="button" ngb-dropdown-item>Save as draft</button>\r
            <button type="button" ngb-dropdown-item>Save and publish</button>\r
            <button type="button" ngb-dropdown-item>Save a copy</button>\r
        </div>\r
    </div>\r
</div>\r
`,l=`<div class="form-check form-switch mb-3">\r
    <input\r
        class="form-check-input"\r
        type="checkbox"\r
        role="switch"\r
        id="dropdown-restricted-items"\r
        ng-model="example.restricted">\r
    <label class="form-check-label" for="dropdown-restricted-items">Disable restricted actions</label>\r
</div>\r
\r
<div ngb-dropdown>\r
    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Project actions</button>\r
    <div ngb-dropdown-menu>\r
        <button type="button" ngb-dropdown-item>Open project</button>\r
        <button type="button" ngb-dropdown-item ng-disabled="example.restricted">Archive project</button>\r
        <button type="button" ngb-dropdown-item ng-disabled="example.restricted">Delete project</button>\r
        <div class="dropdown-divider"></div>\r
        <button type="button" ngb-dropdown-item ng-disabled="true">Unavailable action</button>\r
    </div>\r
</div>\r
`,u=`<div ngb-dropdown auto-close="'outside'">\r
    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Sign in</button>\r
    <div ngb-dropdown-menu class="p-3">\r
        <form ng-submit="example.submit()">\r
            <div class="mb-3">\r
                <label class="form-label" for="dropdown-form-email">Email address</label>\r
                <input\r
                    id="dropdown-form-email"\r
                    type="email"\r
                    class="form-control"\r
                    placeholder="name@example.com"\r
                    ng-model="example.email"\r
                    required>\r
            </div>\r
            <div class="form-check mb-3">\r
                <input\r
                    id="dropdown-form-remember"\r
                    type="checkbox"\r
                    class="form-check-input"\r
                    ng-model="example.remember">\r
                <label class="form-check-label" for="dropdown-form-remember">Remember me</label>\r
            </div>\r
            <button type="submit" class="btn btn-primary w-100">Continue</button>\r
            <p class="small text-success mt-2 mb-0" ng-if="example.submitted">Form submitted.</p>\r
        </form>\r
    </div>\r
</div>\r
`,d=`<div class="border rounded p-3 overflow-hidden">\r
    <p class="small text-body-secondary mb-3">\r
        The wrapper clips overflowing content, but the menu is appended to the document body.\r
    </p>\r
\r
    <div ngb-dropdown container="body">\r
        <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Open body container</button>\r
        <div ngb-dropdown-menu>\r
            <button type="button" ngb-dropdown-item>Account</button>\r
            <button type="button" ngb-dropdown-item>Notifications</button>\r
            <button type="button" ngb-dropdown-item>Privacy</button>\r
        </div>\r
    </div>\r
</div>\r
`,f=`<nav class="navbar bg-body-tertiary border rounded px-3">\r
    <span class="navbar-brand mb-0">Workspace</span>\r
\r
    <div class="ms-auto" ngb-dropdown display="dynamic" placement="'bottom-end'">\r
        <button type="button" class="btn btn-outline-primary" ngb-dropdown-toggle>Account</button>\r
        <div ngb-dropdown-menu>\r
            <button type="button" ngb-dropdown-item>Profile</button>\r
            <button type="button" ngb-dropdown-item>Preferences</button>\r
            <div class="dropdown-divider"></div>\r
            <button type="button" ngb-dropdown-item>Sign out</button>\r
        </div>\r
    </div>\r
</nav>\r
`,p=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            The menu prefers the top placement, uses the body container and closes only after an outside click.\r
        </p>\r
    </div>\r
</div>\r
\r
<div ngb-dropdown>\r
    <button type="button" class="btn btn-primary" ngb-dropdown-toggle>Globally configured</button>\r
    <div ngb-dropdown-menu>\r
        <button type="button" ngb-dropdown-item>This click keeps the menu open</button>\r
        <button type="button" ngb-dropdown-item>So does this one</button>\r
    </div>\r
</div>\r
`,m=class{examples={simple:{html:o},manual:{html:s,typescript:a},buttonGroups:{html:c},disabledItems:{html:l,typescript:n},form:{html:u,typescript:r},body:{html:d},navbar:{html:f},global:{html:p,typescript:i}}};m=t([e({selector:`docs-dropdown-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/dropdown-examples-page.component-067361f3.html`,styleUrl:`./dropdown-examples-page.component.css`})],m);export{m as DropdownExamplesPageComponent};