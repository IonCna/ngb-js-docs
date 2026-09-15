import{r as e,t}from"./decorate-DwQZkZoC.js";var n=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open component offcanvas</button>
<p class="small text-body-secondary mt-2 mb-0">{{ example.lastResult }}</p>
`,r=`import { Component, Inject } from "ngjs-core";
import { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-component-content",
    controllerAs: "example",
    templateUrl: "./offcanvas-component-content.component.html",
    styleUrl: "./offcanvas-component-content.component.css",
})
export class OffcanvasComponentContentComponent {
    public lastResult = "No result yet";

    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}

    public async open() {
        const offcanvasRef = await this.offcanvas.open(OffcanvasDemoContentComponent);

        offcanvasRef.closed.subscribe((result) => {
            this.lastResult = \`Closed with: \${result}\`;
        });

        offcanvasRef.dismissed.subscribe((reason) => {
            this.lastResult = \`Dismissed with: \${reason}\`;
        });
    }
}
`,i=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open default offcanvas</button>

<ng-template ng-ref="content" let-close="close" let-dismiss="dismiss">
    <div class="offcanvas-header">
        <h2 class="offcanvas-title fs-5">Default offcanvas</h2>
        <button type="button" class="btn-close" aria-label="Close" ng-click="dismiss('header close')"></button>
    </div>
    <div class="offcanvas-body">
        <p>This offcanvas uses the global defaults without passing local options.</p>
        <div class="d-flex flex-wrap gap-2">
            <button type="button" class="btn btn-outline-secondary" ng-click="dismiss('cancel')">Cancel</button>
            <button type="button" class="btn btn-primary" ng-click="close('accepted')">Continue</button>
        </div>
    </div>
</ng-template>
`,a=`import { Component, Inject, TemplateRef, ViewChild } from "ngjs-core";
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-default",
    controllerAs: "example",
    templateUrl: "./offcanvas-default.component.html",
    styleUrl: "./offcanvas-default.component.css",
})
export class OffcanvasDefaultComponent {
    @ViewChild("content", { read: TemplateRef, static: true })
    private content!: TemplateRef<unknown>;

    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}

    public open() {
        this.offcanvas.open(this.content);
    }
}
`,o=`<div class="offcanvas-header">
    <h2 class="offcanvas-title fs-5">Component offcanvas</h2>
    <button
        type="button"
        class="btn-close"
        aria-label="Close"
        ng-click="$.ngbActiveOffcanvas.dismiss('header close')">
    </button>
</div>

<div class="offcanvas-body">
    <p>This panel receives a registered component as its content.</p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-secondary" ng-click="$.ngbActiveOffcanvas.dismiss('cancel')">
            Cancel
        </button>
        <button type="button" class="btn btn-primary" ng-click="$.ngbActiveOffcanvas.close('accepted')">
            Continue
        </button>
    </div>
</div>
`,s=`import { Component, Input } from "ngjs-core";
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-demo-content",
    controllerAs: "$",
    templateUrl: "./offcanvas-demo-content.component.html",
    styleUrl: "./offcanvas-demo-content.component.css",
})
export class OffcanvasDemoContentComponent {
    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;
}
`,c=`<p class="text-body-secondary">
    The first focusable element receives focus by default. Add <code>ngbAutofocus</code> to choose another target.
</p>

<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-primary" ng-click="example.openDefaultFocus()">Focus first element</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomFocus()">Use ngbAutofocus</button>
</div>
`,l=`import { Component, Inject } from "ngjs-core";
import { OffcanvasFocusContentComponent } from "@/features/offcanvas/components/offcanvas-focus-content/offcanvas-focus-content.component"
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-focus",
    controllerAs: "example",
    templateUrl: "./offcanvas-focus.component.html",
    styleUrl: "./offcanvas-focus.component.css",
})
export class OffcanvasFocusComponent {
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}

    public openDefaultFocus() {
        this.offcanvas.open(OffcanvasFocusContentComponent, {
            ariaLabelledBy: "offcanvas-focus-title",
            bindings: { autofocus: false },
        });
    }

    public openCustomFocus() {
        this.offcanvas.open(OffcanvasFocusContentComponent, {
            ariaLabelledBy: "offcanvas-focus-title",
            bindings: { autofocus: true },
        });
    }
}
`,u=`<div class="offcanvas-header">
    <h2 class="offcanvas-title fs-5" id="offcanvas-focus-title">Focus management</h2>
</div>

<div class="offcanvas-body">
    <div class="mb-3">
        <label class="form-label" for="offcanvas-first-focusable">First focusable element</label>
        <input id="offcanvas-first-focusable" type="text" class="form-control" placeholder="Focused by default">
    </div>

    <div class="mb-3" ng-if="$.autofocus">
        <label class="form-label" for="offcanvas-custom-autofocus">Custom autofocus target</label>
        <input
            id="offcanvas-custom-autofocus"
            type="text"
            class="form-control"
            placeholder="Focused through ngbAutofocus"
            ngbAutofocus>
    </div>

    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveOffcanvas.close()">Done</button>
</div>
`,d=`import { Component, Input } from "ngjs-core";
import type { NgbActiveOffcanvas } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-focus-content",
    controllerAs: "$",
    templateUrl: "./offcanvas-focus-content.component.html",
    styleUrl: "./offcanvas-focus-content.component.css",
})
export class OffcanvasFocusContentComponent {
    @Input() ngbActiveOffcanvas!: NgbActiveOffcanvas;
    @Input() autofocus = false;
}
`,f=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            The panel opens from the end, allows body scrolling, uses a static backdrop and ignores Escape.
            This documentation example restores the shared defaults immediately after opening.
        </p>
    </div>
</div>

<button type="button" class="btn btn-primary" ng-click="example.open()">Open globally configured offcanvas</button>
`,p=`import { Component, Inject, type OnDestroy } from "ngjs-core";
import { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, NgbOffcanvasConfig, NGB_OFFCANVAS, NGB_OFFCANVAS_CONFIG } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-global",
    controllerAs: "example",
    templateUrl: "./offcanvas-global.component.html",
    styleUrl: "./offcanvas-global.component.css",
})
export class OffcanvasGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<
        NgbOffcanvasConfig,
        "backdrop" | "keyboard" | "position" | "scroll"
    >;

    constructor(
        @Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas,
        @Inject(NGB_OFFCANVAS_CONFIG) private readonly config: NgbOffcanvasConfig,
    ) {
        this.initialConfig = {
            backdrop: config.backdrop,
            keyboard: config.keyboard,
            position: config.position,
            scroll: config.scroll,
        };
    }

    public async open() {
        this.applyConfig();

        try {
            await this.offcanvas.open(OffcanvasDemoContentComponent);
        } finally {
            this.restoreConfig();
        }
    }

    public ngOnDestroy() {
        this.restoreConfig();
    }

    private applyConfig() {
        this.config.backdrop = "static";
        this.config.keyboard = false;
        this.config.position = "end";
        this.config.scroll = true;
    }

    private restoreConfig() {
        this.config.backdrop = this.initialConfig.backdrop;
        this.config.keyboard = this.initialConfig.keyboard;
        this.config.position = this.initialConfig.position;
        this.config.scroll = this.initialConfig.scroll;
    }
}
`,m=`.panel { --bs-offcanvas-width: 28rem; border-color: var(--bs-primary-border-subtle); box-shadow: 0 1rem 3rem rgba(var(--bs-primary-rgb), .14); }\r
.panel .offcanvas-header { background: color-mix(in srgb, var(--bs-primary-bg-subtle) 55%, var(--bs-body-bg)); }\r
.backdrop { --bs-backdrop-bg: var(--bs-danger); --bs-backdrop-opacity: .35; }\r
`,h=`<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomPanel()">Custom panel class</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openStaticBackdrop()">Static backdrop</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openStart()">Start</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openEnd()">End</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openTop()">Top</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openBottom()">Bottom</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openScrollableBody()">Body scrolling</button>
</div>
`,g=`import { Component, Inject } from "ngjs-core";
import { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, type NgbOffcanvasOptions, NGB_OFFCANVAS } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-options",
    controllerAs: "example",
    templateUrl: "./offcanvas-options.component.html",
    styleUrl: "./offcanvas-options.component.css",
})
export class OffcanvasOptionsComponent {
    constructor(@Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas) {}

    public openCustomPanel() {
        this.open({ panelClass: "panel" });
    }

    public openStaticBackdrop() {
        this.open({
            backdrop: "static",
            backdropClass: "backdrop",
            keyboard: false,
        });
    }

    public openStart() {
        this.open({ position: "start" });
    }

    public openEnd() {
        this.open({ position: "end" });
    }

    public openTop() {
        this.open({ position: "top" });
    }

    public openBottom() {
        this.open({ position: "bottom" });
    }

    public openScrollableBody() {
        this.open({ scroll: true, backdrop: false });
    }

    private open(options: NgbOffcanvasOptions) {
        this.offcanvas.open(OffcanvasDemoContentComponent, options);
    }
}
`,_=class{examples={defaults:{html:i,typescript:a},componentContent:{html:`<!-- offcanvas-component-content.component.html -->\n${n}\n\n<!-- offcanvas-demo-content.component.html -->\n${o}`,typescript:`${r}\n\n// offcanvas-demo-content.component.ts\n${s}`},focus:{html:`<!-- offcanvas-focus.component.html -->\n${c}\n\n<!-- offcanvas-focus-content.component.html -->\n${u}`,typescript:`${l}\n\n// offcanvas-focus-content.component.ts\n${d}`},options:{html:h,typescript:g,css:m},global:{html:f,typescript:p}}};_=t([e({selector:`docs-offcanvas-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/offcanvas-examples-page.component-c094aaaa.html`,styleUrl:`./offcanvas-examples-page.component.css`})],_);export{_ as OffcanvasExamplesPageComponent};