import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open component offcanvas</button>\r
<p class="small text-body-secondary mt-2 mb-0">{{ example.lastResult }}</p>\r
`,r=`import { Component, Inject } from "ngjs-core";\r
import { OffcanvasDemoContentComponent } from "@/features/lib/components/offcanvas-demo-content/offcanvas-demo-content.component"\r
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";\r
\r
@Component({\r
    selector: "docs-offcanvas-component-content",\r
    controllerAs: "example",\r
    templateUrl: "./offcanvas-component-content.component.html",\r
    styleUrl: "./offcanvas-component-content.component.css",\r
})\r
export class OffcanvasComponentContentComponent {\r
    public lastResult = "No result yet";\r
\r
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}\r
\r
    public async open() {\r
        const offcanvasRef = await this.offcanvas.open(OffcanvasDemoContentComponent);\r
\r
        offcanvasRef.closed.subscribe((result) => {\r
            this.lastResult = \`Closed with: \${result}\`;\r
        });\r
\r
        offcanvasRef.dismissed.subscribe((reason) => {\r
            this.lastResult = \`Dismissed with: \${reason}\`;\r
        });\r
    }\r
}\r
`,i=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open default offcanvas</button>\r
\r
<ng-template ng-ref="content" let-close="close" let-dismiss="dismiss">\r
    <div class="offcanvas-header">\r
        <h2 class="offcanvas-title fs-5">Default offcanvas</h2>\r
        <button type="button" class="btn-close" aria-label="Close" ng-click="dismiss('header close')"></button>\r
    </div>\r
    <div class="offcanvas-body">\r
        <p>This offcanvas uses the global defaults without passing local options.</p>\r
        <div class="d-flex flex-wrap gap-2">\r
            <button type="button" class="btn btn-outline-secondary" ng-click="dismiss('cancel')">Cancel</button>\r
            <button type="button" class="btn btn-primary" ng-click="close('accepted')">Continue</button>\r
        </div>\r
    </div>\r
</ng-template>\r
`,a=`import { Component, Inject, TemplateRef, ViewChild } from "ngjs-core";\r
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";\r
\r
@Component({\r
    selector: "docs-offcanvas-default",\r
    controllerAs: "example",\r
    templateUrl: "./offcanvas-default.component.html",\r
    styleUrl: "./offcanvas-default.component.css",\r
})\r
export class OffcanvasDefaultComponent {\r
    @ViewChild("content", { read: TemplateRef, static: true })\r
    private content!: TemplateRef<unknown>;\r
\r
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}\r
\r
    public open() {\r
        this.offcanvas.open(this.content);\r
    }\r
}\r
`,o=`<div class="offcanvas-header">\r
    <h2 class="offcanvas-title fs-5">Component offcanvas</h2>\r
    <button\r
        type="button"\r
        class="btn-close"\r
        aria-label="Close"\r
        ng-click="$.ngbActiveOffcanvas.dismiss('header close')">\r
    </button>\r
</div>\r
\r
<div class="offcanvas-body">\r
    <p>This panel receives a registered component as its content.</p>\r
    <div class="d-flex flex-wrap gap-2">\r
        <button type="button" class="btn btn-outline-secondary" ng-click="$.ngbActiveOffcanvas.dismiss('cancel')">\r
            Cancel\r
        </button>\r
        <button type="button" class="btn btn-primary" ng-click="$.ngbActiveOffcanvas.close('accepted')">\r
            Continue\r
        </button>\r
    </div>\r
</div>\r
`,s=`import { Component, Input } from "ngjs-core";\r
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";\r
\r
@Component({\r
    selector: "docs-offcanvas-demo-content",\r
    controllerAs: "$",\r
    templateUrl: "./offcanvas-demo-content.component.html",\r
    styleUrl: "./offcanvas-demo-content.component.css",\r
})\r
export class OffcanvasDemoContentComponent {\r
    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;\r
}\r
`,c=`<p class="text-body-secondary">\r
    The first focusable element receives focus by default. Add <code>ngbAutofocus</code> to choose another target.\r
</p>\r
\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-primary" ng-click="example.openDefaultFocus()">Focus first element</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomFocus()">Use ngbAutofocus</button>\r
</div>\r
`,l=`import { Component, Inject } from "ngjs-core";\r
import { OffcanvasFocusContentComponent } from "@/features/lib/components/offcanvas-focus-content/offcanvas-focus-content.component"\r
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";\r
\r
@Component({\r
    selector: "docs-offcanvas-focus",\r
    controllerAs: "example",\r
    templateUrl: "./offcanvas-focus.component.html",\r
    styleUrl: "./offcanvas-focus.component.css",\r
})\r
export class OffcanvasFocusComponent {\r
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}\r
\r
    public openDefaultFocus() {\r
        this.offcanvas.open(OffcanvasFocusContentComponent, {\r
            ariaLabelledBy: "offcanvas-focus-title",\r
            bindings: { autofocus: false },\r
        });\r
    }\r
\r
    public openCustomFocus() {\r
        this.offcanvas.open(OffcanvasFocusContentComponent, {\r
            ariaLabelledBy: "offcanvas-focus-title",\r
            bindings: { autofocus: true },\r
        });\r
    }\r
}\r
`,u=`<div class="offcanvas-header">\r
    <h2 class="offcanvas-title fs-5" id="offcanvas-focus-title">Focus management</h2>\r
</div>\r
\r
<div class="offcanvas-body">\r
    <div class="mb-3">\r
        <label class="form-label" for="offcanvas-first-focusable">First focusable element</label>\r
        <input id="offcanvas-first-focusable" type="text" class="form-control" placeholder="Focused by default">\r
    </div>\r
\r
    <div class="mb-3" ng-if="$.autofocus">\r
        <label class="form-label" for="offcanvas-custom-autofocus">Custom autofocus target</label>\r
        <input\r
            id="offcanvas-custom-autofocus"\r
            type="text"\r
            class="form-control"\r
            placeholder="Focused through ngbAutofocus"\r
            ngbAutofocus>\r
    </div>\r
\r
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveOffcanvas.close()">Done</button>\r
</div>\r
`,d=`import { Component, Input } from "ngjs-core";\r
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";\r
\r
@Component({\r
    selector: "docs-offcanvas-focus-content",\r
    controllerAs: "$",\r
    templateUrl: "./offcanvas-focus-content.component.html",\r
    styleUrl: "./offcanvas-focus-content.component.css",\r
})\r
export class OffcanvasFocusContentComponent {\r
    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;\r
    @Input() autofocus = false;\r
}\r
`,f=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            The panel opens from the end, allows body scrolling, uses a static backdrop and ignores Escape.\r
            This documentation example restores the shared defaults immediately after opening.\r
        </p>\r
    </div>\r
</div>\r
\r
<button type="button" class="btn btn-primary" ng-click="example.open()">Open globally configured offcanvas</button>\r
`,p=`import { Component, Inject, type OnDestroy } from "ngjs-core";\r
import { OffcanvasDemoContentComponent } from "@/features/lib/components/offcanvas-demo-content/offcanvas-demo-content.component"\r
import { NgbOffcanvas, NgbOffcanvasConfig, NGB_OFFCANVAS, NGB_OFFCANVAS_CONFIG } from "ngb-js/offcanvas";\r
\r
@Component({\r
    selector: "docs-offcanvas-global",\r
    controllerAs: "example",\r
    templateUrl: "./offcanvas-global.component.html",\r
    styleUrl: "./offcanvas-global.component.css",\r
})\r
export class OffcanvasGlobalComponent implements OnDestroy {\r
    private readonly initialConfig: Pick<\r
        NgbOffcanvasConfig,\r
        "backdrop" | "keyboard" | "position" | "scroll"\r
    >;\r
\r
    constructor(\r
        @Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas,\r
        @Inject(NGB_OFFCANVAS_CONFIG) private readonly config: NgbOffcanvasConfig,\r
    ) {\r
        this.initialConfig = {\r
            backdrop: config.backdrop,\r
            keyboard: config.keyboard,\r
            position: config.position,\r
            scroll: config.scroll,\r
        };\r
    }\r
\r
    public async open() {\r
        this.applyConfig();\r
\r
        try {\r
            await this.offcanvas.open(OffcanvasDemoContentComponent);\r
        } finally {\r
            this.restoreConfig();\r
        }\r
    }\r
\r
    public ngOnDestroy() {\r
        this.restoreConfig();\r
    }\r
\r
    private applyConfig() {\r
        this.config.backdrop = "static";\r
        this.config.keyboard = false;\r
        this.config.position = "end";\r
        this.config.scroll = true;\r
    }\r
\r
    private restoreConfig() {\r
        this.config.backdrop = this.initialConfig.backdrop;\r
        this.config.keyboard = this.initialConfig.keyboard;\r
        this.config.position = this.initialConfig.position;\r
        this.config.scroll = this.initialConfig.scroll;\r
    }\r
}\r
`,m=`.panel { --bs-offcanvas-width: 28rem; border-color: var(--bs-primary-border-subtle); box-shadow: 0 1rem 3rem rgba(var(--bs-primary-rgb), .14); }
.panel .offcanvas-header { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 55%, var(--bs-body-bg)); }
.backdrop { --bs-backdrop-bg: var(--bs-danger); --bs-backdrop-opacity: .35; }
`,h=`<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomPanel()">Custom panel class</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openStaticBackdrop()">Static backdrop</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openStart()">Start</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openEnd()">End</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openTop()">Top</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openBottom()">Bottom</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openScrollableBody()">Body scrolling</button>\r
</div>\r
`,g=`import { Component, Inject } from "ngjs-core";\r
import { OffcanvasDemoContentComponent } from "@/features/lib/components/offcanvas-demo-content/offcanvas-demo-content.component"\r
import { NgbOffcanvas, type NgbOffcanvasOptions, NGB_OFFCANVAS } from "ngb-js/offcanvas";\r
\r
@Component({\r
    selector: "docs-offcanvas-options",\r
    controllerAs: "example",\r
    templateUrl: "./offcanvas-options.component.html",\r
    styleUrl: "./offcanvas-options.component.css",\r
})\r
export class OffcanvasOptionsComponent {\r
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}\r
\r
    public openCustomPanel() {\r
        this.open({ panelClass: "panel" });\r
    }\r
\r
    public openStaticBackdrop() {\r
        this.open({\r
            backdrop: "static",\r
            backdropClass: "backdrop",\r
            keyboard: false,\r
        });\r
    }\r
\r
    public openStart() {\r
        this.open({ position: "start" });\r
    }\r
\r
    public openEnd() {\r
        this.open({ position: "end" });\r
    }\r
\r
    public openTop() {\r
        this.open({ position: "top" });\r
    }\r
\r
    public openBottom() {\r
        this.open({ position: "bottom" });\r
    }\r
\r
    public openScrollableBody() {\r
        this.open({ scroll: true, backdrop: false });\r
    }\r
\r
    private open(options: NgbOffcanvasOptions) {\r
        this.offcanvas.open(OffcanvasDemoContentComponent, options);\r
    }\r
}\r
`,_=class{examples={defaults:{html:i,typescript:a},componentContent:{html:`<!-- offcanvas-component-content.component.html -->\n${n}\n\n<!-- offcanvas-demo-content.component.html -->\n${o}`,typescript:`${r}\n\n// offcanvas-demo-content.component.ts\n${s}`},focus:{html:`<!-- offcanvas-focus.component.html -->\n${c}\n\n<!-- offcanvas-focus-content.component.html -->\n${u}`,typescript:`${l}\n\n// offcanvas-focus-content.component.ts\n${d}`},options:{html:h,typescript:g,css:m},global:{html:f,typescript:p}}};_=t([e({selector:`docs-offcanvas-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/offcanvas-examples-page.component-acf65a02.html`,styleUrl:`./offcanvas-examples-page.component.css`})],_);export{_ as OffcanvasExamplesPageComponent};