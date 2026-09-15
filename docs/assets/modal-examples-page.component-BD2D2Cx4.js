import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`import { Component, Inject } from "ngjs-core";\r
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"\r
import { NgbModal, NGB_MODAL } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-component-content",\r
    controllerAs: "example",\r
    templateUrl: "./modal-component-content.component.html",\r
    styleUrl: "./modal-component-content.component.css",\r
})\r
export class ModalComponentContentComponent {\r
    public lastResult = "No result yet";\r
\r
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}\r
\r
    public async open() {\r
        const modalRef = await this.modal.open(ModalDemoContentComponent, {\r
            bindings: {\r
                title: "Component as content",\r
                description: "NgbActiveModal is provided directly to the content component.",\r
            },\r
        });\r
\r
        modalRef.closed.subscribe((result) => {\r
            this.lastResult = \`Closed with: \${result}\`;\r
        });\r
\r
        modalRef.dismissed.subscribe((reason) => {\r
            this.lastResult = \`Dismissed with: \${reason}\`;\r
        });\r
    }\r
}\r
`,r=`import { Component, Inject, TemplateRef, ViewChild } from "ngjs-core";\r
import { NgbModal, NGB_MODAL } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-default",\r
    controllerAs: "example",\r
    templateUrl: "./modal-default.component.html",\r
    styleUrl: "./modal-default.component.css",\r
})\r
export class ModalDefaultComponent {\r
    @ViewChild("content", { read: TemplateRef, static: true })\r
    private content!: TemplateRef<unknown>;\r
\r
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}\r
\r
    public open() {\r
        this.modal.open(this.content);\r
    }\r
}\r
`,i=`import { Component, Input } from "ngjs-core";\r
import type { NgbActiveModal } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-demo-content",\r
    controllerAs: "$",\r
    templateUrl: "./modal-demo-content.component.html",\r
    styleUrl: "./modal-demo-content.component.css",\r
})\r
export class ModalDemoContentComponent {\r
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\r
    @Input() title = "Component modal";\r
    @Input() description = "This modal receives a component as its content.";\r
    @Input() longContent = false;\r
    public readonly items = Array.from({ length: 24 }, (_, index) => \`Scrollable content row \${index + 1}\`);\r
}\r
`,a=`import { Component, Inject } from "ngjs-core";\r
import { ModalFocusContentComponent } from "@/features/lib/components/modal-focus-content/modal-focus-content.component"\r
import { NgbModal, NGB_MODAL } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-focus",\r
    controllerAs: "example",\r
    templateUrl: "./modal-focus.component.html",\r
    styleUrl: "./modal-focus.component.css",\r
})\r
export class ModalFocusComponent {\r
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}\r
\r
    public openDefaultFocus() {\r
        this.modal.open(ModalFocusContentComponent, {\r
            ariaLabelledBy: "modal-focus-title",\r
            bindings: { autofocus: false },\r
        });\r
    }\r
\r
    public openCustomFocus() {\r
        this.modal.open(ModalFocusContentComponent, {\r
            ariaLabelledBy: "modal-focus-title",\r
            bindings: { autofocus: true },\r
        });\r
    }\r
}\r
`,o=`import { Component, Input } from "ngjs-core";\r
import type { NgbActiveModal } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-focus-content",\r
    controllerAs: "$",\r
    templateUrl: "./modal-focus-content.component.html",\r
    styleUrl: "./modal-focus-content.component.css",\r
})\r
export class ModalFocusContentComponent {\r
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\r
    @Input() autofocus = false;\r
}\r
`,s=`import { Component, Inject, type OnDestroy } from "ngjs-core";\r
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"\r
import { NgbModal, NgbModalConfig, NGB_MODAL, NGB_MODAL_CONFIG } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-global",\r
    controllerAs: "example",\r
    templateUrl: "./modal-global.component.html",\r
    styleUrl: "./modal-global.component.css",\r
})\r
export class ModalGlobalComponent implements OnDestroy {\r
    private readonly initialConfig: Pick<NgbModalConfig, "backdrop" | "centered" | "keyboard" | "size">;\r
\r
    constructor(\r
        @Inject(NGB_MODAL) private readonly modal: NgbModal,\r
        @Inject(NGB_MODAL_CONFIG) private readonly config: NgbModalConfig,\r
    ) {\r
        this.initialConfig = {\r
            backdrop: config.backdrop,\r
            centered: config.centered,\r
            keyboard: config.keyboard,\r
            size: config.size,\r
        };\r
\r
    }\r
\r
    public async open() {\r
        this.applyConfig();\r
\r
        try {\r
            await this.modal.open(ModalDemoContentComponent, {\r
                bindings: {\r
                    title: "Globally configured modal",\r
                    description: "This modal is centered, large and cannot be dismissed with Escape or a backdrop click.",\r
                },\r
            });\r
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
        this.config.centered = true;\r
        this.config.keyboard = false;\r
        this.config.size = "lg";\r
    }\r
\r
    private restoreConfig() {\r
        this.config.backdrop = this.initialConfig.backdrop;\r
        this.config.centered = this.initialConfig.centered;\r
        this.config.keyboard = this.initialConfig.keyboard;\r
        this.config.size = this.initialConfig.size;\r
    }\r
}\r
`,c=`.window .modal-content { border-top: .35rem solid var(--bs-primary); box-shadow: 0 1.5rem 4rem rgba(var(--bs-body-color-rgb), .2); }
.backdrop, .updated-backdrop { --bs-backdrop-bg: var(--bs-danger); --bs-backdrop-opacity: .35; }
.dialog .modal-content, .updated-dialog .modal-content { border-radius: 1.5rem; border-color: var(--bs-primary-border-subtle); box-shadow: 0 1rem 3rem rgba(var(--bs-primary-rgb), .18); }
.updated-window .modal-content { border-color: var(--bs-success); box-shadow: 0 1rem 3rem rgba(var(--bs-body-color-rgb), .18); }
`,l=`import { Component, Inject } from "ngjs-core";\r
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"\r
import { NgbModal, type NgbModalOptions, NGB_MODAL } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-options",\r
    controllerAs: "example",\r
    templateUrl: "./modal-options.component.html",\r
    styleUrl: "./modal-options.component.css",\r
})\r
export class ModalOptionsComponent {\r
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}\r
\r
    public openCustomWindow() {\r
        this.open("Custom window class", { windowClass: "window" });\r
    }\r
\r
    public openStaticBackdrop() {\r
        this.open("Static custom backdrop", {\r
            backdrop: "static",\r
            backdropClass: "backdrop",\r
            keyboard: false,\r
        });\r
    }\r
\r
    public openSmall() {\r
        this.open("Small modal", { size: "sm" });\r
    }\r
\r
    public openLarge() {\r
        this.open("Large modal", { size: "lg" });\r
    }\r
\r
    public openExtraLarge() {\r
        this.open("Extra large modal", { size: "xl" });\r
    }\r
\r
    public openFullscreen() {\r
        this.open("Fullscreen modal", { fullscreen: true });\r
    }\r
\r
    public openCentered() {\r
        this.open("Vertically centered modal", { centered: true });\r
    }\r
\r
    public openScrollable() {\r
        this.open("Scrollable modal", { scrollable: true, size: "lg" }, true);\r
    }\r
\r
    public openCustomDialog() {\r
        this.open("Custom dialog class", { modalDialogClass: "dialog" });\r
    }\r
\r
    private open(title: string, options: NgbModalOptions, longContent = false) {\r
        this.modal.open(ModalDemoContentComponent, {\r
            ...options,\r
            bindings: {\r
                title,\r
                description: "These values are applied only to this modal instance.",\r
                longContent,\r
            },\r
        });\r
    }\r
}\r
`,u=`import { Component, Inject } from "ngjs-core";\r
import { ModalStackedContentComponent } from "@/features/lib/components/modal-stacked-content/modal-stacked-content.component"\r
import { NgbModal, NGB_MODAL } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-stacked",\r
    controllerAs: "example",\r
    templateUrl: "./modal-stacked.component.html",\r
    styleUrl: "./modal-stacked.component.css",\r
})\r
export class ModalStackedComponent {\r
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}\r
\r
    public async openStack() {\r
        for (let level = 1; level <= 3; level++) {\r
            await this.modal.open(ModalStackedContentComponent, {\r
                bindings: {\r
                    level,\r
                },\r
            });\r
        }\r
    }\r
}\r
`,d=`import { Component, Inject, Input } from "ngjs-core";\r
import { NgbModal, type NgbActiveModal, NGB_MODAL } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-stacked-content",\r
    controllerAs: "$",\r
    templateUrl: "./modal-stacked-content.component.html",\r
    styleUrl: "./modal-stacked-content.component.css",\r
})\r
export class ModalStackedContentComponent {\r
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\r
    @Input() level = 1;\r
\r
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}\r
\r
    public dismissAll() {\r
        this.modal.dismissAll("Dismiss all");\r
    }\r
}\r
`,f=`import { Component, Inject } from "ngjs-core";\r
import { ModalUpdatableContentComponent } from "@/features/lib/components/modal-updatable-content/modal-updatable-content.component"\r
import { NgbModal, NGB_MODAL } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-updatable",\r
    controllerAs: "example",\r
    templateUrl: "./modal-updatable.component.html",\r
    styleUrl: "./modal-updatable.component.css",\r
})\r
export class ModalUpdatableComponent {\r
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}\r
\r
    public open() {\r
        this.modal.open(ModalUpdatableContentComponent, {\r
            ariaLabelledBy: "updatable-modal-title",\r
            ariaDescribedBy: "updatable-modal-description",\r
            size: "sm",\r
        });\r
    }\r
}\r
`,p=`import { Component, Input } from "ngjs-core";\r
import type { NgbActiveModal, NgbModalUpdatableOptions } from "ngb-js/modal";\r
\r
@Component({\r
    selector: "docs-modal-updatable-content",\r
    controllerAs: "$",\r
    templateUrl: "./modal-updatable-content.component.html",\r
    styleUrl: "./modal-updatable-content.component.css",\r
})\r
export class ModalUpdatableContentComponent {\r
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;\r
    public ariaReferences = true;\r
    public centered = false;\r
    public fullscreen = false;\r
    public customBackdrop = false;\r
    public size: NgbModalUpdatableOptions["size"] = "sm";\r
    public customWindow = false;\r
    public customDialog = false;\r
\r
    public toggleAriaReferences() {\r
        this.ariaReferences = !this.ariaReferences;\r
        this.ngbActiveModal.update({\r
            ariaLabelledBy: this.ariaReferences ? "updatable-modal-title" : "",\r
            ariaDescribedBy: this.ariaReferences ? "updatable-modal-description" : "",\r
        });\r
    }\r
\r
    public toggleCentered() {\r
        this.centered = !this.centered;\r
        this.ngbActiveModal.update({ centered: this.centered });\r
    }\r
\r
    public toggleFullscreen() {\r
        this.fullscreen = !this.fullscreen;\r
        this.ngbActiveModal.update({ fullscreen: this.fullscreen });\r
    }\r
\r
    public toggleBackdropClass() {\r
        this.customBackdrop = !this.customBackdrop;\r
        this.ngbActiveModal.update({ backdropClass: this.customBackdrop ? "updated-backdrop" : "" });\r
    }\r
\r
    public cycleSize() {\r
        const sizes: Array<NgbModalUpdatableOptions["size"]> = ["sm", "lg", "xl"];\r
        this.size = sizes[(sizes.indexOf(this.size) + 1) % sizes.length];\r
        this.ngbActiveModal.update({ size: this.size });\r
    }\r
\r
    public toggleWindowClass() {\r
        this.customWindow = !this.customWindow;\r
        this.ngbActiveModal.update({ windowClass: this.customWindow ? "updated-window" : "" });\r
    }\r
\r
    public toggleDialogClass() {\r
        this.customDialog = !this.customDialog;\r
        this.ngbActiveModal.update({ modalDialogClass: this.customDialog ? "updated-dialog" : "" });\r
    }\r
}\r
`,m=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open default modal</button>\r
\r
<ng-template ng-ref="content" let-close="close" let-dismiss="dismiss">\r
    <div class="modal-header">\r
        <h2 class="modal-title fs-5">Default modal</h2>\r
        <button type="button" class="btn-close" aria-label="Close" ng-click="dismiss('header close')"></button>\r
    </div>\r
    <div class="modal-body">\r
        <p class="mb-0">This modal uses the global defaults without passing local options.</p>\r
    </div>\r
    <div class="modal-footer">\r
        <button type="button" class="btn btn-outline-secondary" ng-click="dismiss('cancel')">Cancel</button>\r
        <button type="button" class="btn btn-primary" ng-click="close('accepted')">Continue</button>\r
    </div>\r
</ng-template>\r
`,h=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open component modal</button>\r
<p class="small text-body-secondary mt-2 mb-0">{{ example.lastResult }}</p>\r
`,g=`<div class="modal-header">\r
    <h2 class="modal-title fs-5">{{ $.title }}</h2>\r
    <button\r
        type="button"\r
        class="btn-close"\r
        aria-label="Close"\r
        ng-click="$.ngbActiveModal.dismiss('header close')">\r
    </button>\r
</div>\r
\r
<div class="modal-body">\r
    <p ng-class="{ 'mb-0': !$.longContent }">{{ $.description }}</p>\r
\r
    <div class="list-group" ng-if="$.longContent">\r
        <div class="list-group-item" ng-repeat="item in $.items track by $index">{{ item }}</div>\r
    </div>\r
</div>\r
\r
<div class="modal-footer">\r
    <button type="button" class="btn btn-outline-secondary" ng-click="$.ngbActiveModal.dismiss('cancel')">\r
        Cancel\r
    </button>\r
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close('accepted')">\r
        Continue\r
    </button>\r
</div>\r
`,_=`<p class="text-body-secondary">\r
    The first focusable element receives focus by default. Add <code>ngbAutofocus</code> to choose another target.\r
</p>\r
\r
<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-primary" ng-click="example.openDefaultFocus()">\r
        Focus first element\r
    </button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomFocus()">\r
        Use ngbAutofocus\r
    </button>\r
</div>\r
`,v=`<div class="modal-header">\r
    <h2 class="modal-title fs-5" id="modal-focus-title">Focus management</h2>\r
</div>\r
\r
<div class="modal-body">\r
    <div class="mb-3">\r
        <label class="form-label" for="modal-first-focusable">First focusable element</label>\r
        <input id="modal-first-focusable" type="text" class="form-control" placeholder="Focused by default">\r
    </div>\r
\r
    <div ng-if="$.autofocus">\r
        <label class="form-label" for="modal-custom-autofocus">Custom autofocus target</label>\r
        <input\r
            id="modal-custom-autofocus"\r
            type="text"\r
            class="form-control"\r
            placeholder="Focused through ngbAutofocus"\r
            ngbAutofocus>\r
    </div>\r
</div>\r
\r
<div class="modal-footer">\r
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Done</button>\r
</div>\r
`,y=`<div class="d-flex flex-wrap gap-2">\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomWindow()">Custom class</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openStaticBackdrop()">Static backdrop</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openSmall()">Small</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openLarge()">Large</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openExtraLarge()">Extra large</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openFullscreen()">Fullscreen</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCentered()">Vertically centered</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openScrollable()">Scrollable content</button>\r
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomDialog()">Dialog custom class</button>\r
</div>\r
`,b=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open updatable modal</button>\r
`,x=`<div class="modal-header">\r
    <h2 class="modal-title fs-5" id="updatable-modal-title">Updatable options</h2>\r
    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('close')"></button>\r
</div>\r
\r
<div class="modal-body">\r
    <p id="updatable-modal-description">\r
        Change the window, dialog, backdrop and accessibility options while this modal remains open.\r
    </p>\r
\r
    <div class="d-flex flex-wrap gap-2">\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleAriaReferences()">\r
            ARIA references: {{ $.ariaReferences ? 'on' : 'off' }}\r
        </button>\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleCentered()">\r
            Centered: {{ $.centered ? 'on' : 'off' }}\r
        </button>\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleFullscreen()">\r
            Fullscreen: {{ $.fullscreen ? 'on' : 'off' }}\r
        </button>\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleBackdropClass()">\r
            Backdrop class: {{ $.customBackdrop ? 'on' : 'off' }}\r
        </button>\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.cycleSize()">\r
            Size: {{ $.size }}\r
        </button>\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleWindowClass()">\r
            Window class: {{ $.customWindow ? 'on' : 'off' }}\r
        </button>\r
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleDialogClass()">\r
            Dialog class: {{ $.customDialog ? 'on' : 'off' }}\r
        </button>\r
    </div>\r
</div>\r
\r
<div class="modal-footer">\r
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Done</button>\r
</div>\r
`,S=`<button type="button" class="btn btn-primary" ng-click="example.openStack()">Open three modals</button>\r
`,C=`<div class="modal-header">\r
    <h2 class="modal-title fs-5">Stacked modal {{ $.level }}</h2>\r
    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('close')"></button>\r
</div>\r
\r
<div class="modal-body">\r
    <p class="mb-0">This is modal layer {{ $.level }} of 3. Close it to return to the previous layer.</p>\r
</div>\r
\r
<div class="modal-footer">\r
    <button type="button" class="btn btn-outline-danger" ng-click="$.dismissAll()">Dismiss all</button>\r
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Close this modal</button>\r
</div>\r
`,w=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            Modals are large, vertically centered, use a static backdrop and ignore the Escape key.\r
            This documentation example restores the shared defaults immediately after opening.\r
        </p>\r
    </div>\r
</div>\r
\r
<button type="button" class="btn btn-primary" ng-click="example.open()">Open globally configured modal</button>\r
`,T=class{examples={defaults:{html:m,typescript:r},componentContent:{html:`<!-- modal-component-content.component.html -->\n${h}\n\n<!-- modal-demo-content.component.html -->\n${g}`,typescript:`${n}\n\n// modal-demo-content.component.ts\n${i}`},focus:{html:`<!-- modal-focus.component.html -->\n${_}\n\n<!-- modal-focus-content.component.html -->\n${v}`,typescript:`${a}\n\n// modal-focus-content.component.ts\n${o}`},options:{html:y,typescript:l,css:c},updatable:{html:`<!-- modal-updatable.component.html -->\n${b}\n\n<!-- modal-updatable-content.component.html -->\n${x}`,typescript:`${f}\n\n// modal-updatable-content.component.ts\n${p}`,css:c},stacked:{html:`<!-- modal-stacked.component.html -->\n${S}\n\n<!-- modal-stacked-content.component.html -->\n${C}`,typescript:`${u}\n\n// modal-stacked-content.component.ts\n${d}`},global:{html:w,typescript:s}}};T=t([e({selector:`docs-modal-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/modal-examples-page.component-3f7237d2.html`,styleUrl:`./modal-examples-page.component.css`})],T);export{T as ModalExamplesPageComponent};