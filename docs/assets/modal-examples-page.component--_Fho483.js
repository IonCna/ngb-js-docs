import{r as e,t}from"./decorate-DwQZkZoC.js";var n=`import { Component, Inject } from "ngjs-core";
import { ModalDemoContentComponent } from "@/features/modal/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-component-content",
    controllerAs: "example",
    templateUrl: "./modal-component-content.component.html",
    styleUrl: "./modal-component-content.component.css",
})
export class ModalComponentContentComponent {
    public lastResult = "No result yet";

    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public async open() {
        const modalRef = await this.modal.open(ModalDemoContentComponent, {
            bindings: {
                title: "Component as content",
                description: "NgbActiveModal is provided directly to the content component.",
            },
        });

        modalRef.closed.subscribe((result) => {
            this.lastResult = \`Closed with: \${result}\`;
        });

        modalRef.dismissed.subscribe((reason) => {
            this.lastResult = \`Dismissed with: \${reason}\`;
        });
    }
}
`,r=`import { Component, Inject, TemplateRef, ViewChild } from "ngjs-core";
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-default",
    controllerAs: "example",
    templateUrl: "./modal-default.component.html",
    styleUrl: "./modal-default.component.css",
})
export class ModalDefaultComponent {
    @ViewChild("content", { read: TemplateRef, static: true })
    private content!: TemplateRef<unknown>;

    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public open() {
        this.modal.open(this.content);
    }
}
`,i=`import { Component, Input } from "ngjs-core";
import type { NgbActiveModal } from "ngb-js/modal";

@Component({
    selector: "docs-modal-demo-content",
    controllerAs: "$",
    templateUrl: "./modal-demo-content.component.html",
    styleUrl: "./modal-demo-content.component.css",
})
export class ModalDemoContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    @Input() title = "Component modal";
    @Input() description = "This modal receives a component as its content.";
    @Input() longContent = false;
    public readonly items = Array.from({ length: 24 }, (_, index) => \`Scrollable content row \${index + 1}\`);
}
`,a=`import { Component, Inject } from "ngjs-core";
import { ModalFocusContentComponent } from "@/features/modal/components/modal-focus-content/modal-focus-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-focus",
    controllerAs: "example",
    templateUrl: "./modal-focus.component.html",
    styleUrl: "./modal-focus.component.css",
})
export class ModalFocusComponent {
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public openDefaultFocus() {
        this.modal.open(ModalFocusContentComponent, {
            ariaLabelledBy: "modal-focus-title",
            bindings: { autofocus: false },
        });
    }

    public openCustomFocus() {
        this.modal.open(ModalFocusContentComponent, {
            ariaLabelledBy: "modal-focus-title",
            bindings: { autofocus: true },
        });
    }
}
`,o=`import { Component, Input } from "ngjs-core";
import type { NgbActiveModal } from "ngb-js/modal";

@Component({
    selector: "docs-modal-focus-content",
    controllerAs: "$",
    templateUrl: "./modal-focus-content.component.html",
    styleUrl: "./modal-focus-content.component.css",
})
export class ModalFocusContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    @Input() autofocus = false;
}
`,s=`import { Component, Inject, type OnDestroy } from "ngjs-core";
import { ModalDemoContentComponent } from "@/features/modal/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, NgbModalConfig, NGB_MODAL, NGB_MODAL_CONFIG } from "ngb-js/modal";

@Component({
    selector: "docs-modal-global",
    controllerAs: "example",
    templateUrl: "./modal-global.component.html",
    styleUrl: "./modal-global.component.css",
})
export class ModalGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbModalConfig, "backdrop" | "centered" | "keyboard" | "size">;

    constructor(
        @Inject(NGB_MODAL) private readonly modal: NgbModal,
        @Inject(NGB_MODAL_CONFIG) private readonly config: NgbModalConfig,
    ) {
        this.initialConfig = {
            backdrop: config.backdrop,
            centered: config.centered,
            keyboard: config.keyboard,
            size: config.size,
        };

    }

    public async open() {
        this.applyConfig();

        try {
            await this.modal.open(ModalDemoContentComponent, {
                bindings: {
                    title: "Globally configured modal",
                    description: "This modal is centered, large and cannot be dismissed with Escape or a backdrop click.",
                },
            });
        } finally {
            this.restoreConfig();
        }
    }

    public ngOnDestroy() {
        this.restoreConfig();
    }

    private applyConfig() {
        this.config.backdrop = "static";
        this.config.centered = true;
        this.config.keyboard = false;
        this.config.size = "lg";
    }

    private restoreConfig() {
        this.config.backdrop = this.initialConfig.backdrop;
        this.config.centered = this.initialConfig.centered;
        this.config.keyboard = this.initialConfig.keyboard;
        this.config.size = this.initialConfig.size;
    }
}
`,c=`.window .modal-content { border-top: .35rem solid var(--bs-primary); box-shadow: 0 1.5rem 4rem rgba(var(--bs-body-color-rgb), .2); }\r
.backdrop, .updated-backdrop { --bs-backdrop-bg: var(--bs-danger); --bs-backdrop-opacity: .35; }\r
.dialog .modal-content, .updated-dialog .modal-content { border-radius: 1.5rem; border-color: var(--bs-primary-border-subtle); box-shadow: 0 1rem 3rem rgba(var(--bs-primary-rgb), .18); }\r
.updated-window .modal-content { border-color: var(--bs-success); box-shadow: 0 1rem 3rem rgba(var(--bs-body-color-rgb), .18); }\r
`,l=`import { Component, Inject } from "ngjs-core";
import { ModalDemoContentComponent } from "@/features/modal/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, type NgbModalOptions, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-options",
    controllerAs: "example",
    templateUrl: "./modal-options.component.html",
    styleUrl: "./modal-options.component.css",
})
export class ModalOptionsComponent {
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public openCustomWindow() {
        this.open("Custom window class", { windowClass: "window" });
    }

    public openStaticBackdrop() {
        this.open("Static custom backdrop", {
            backdrop: "static",
            backdropClass: "backdrop",
            keyboard: false,
        });
    }

    public openSmall() {
        this.open("Small modal", { size: "sm" });
    }

    public openLarge() {
        this.open("Large modal", { size: "lg" });
    }

    public openExtraLarge() {
        this.open("Extra large modal", { size: "xl" });
    }

    public openFullscreen() {
        this.open("Fullscreen modal", { fullscreen: true });
    }

    public openCentered() {
        this.open("Vertically centered modal", { centered: true });
    }

    public openScrollable() {
        this.open("Scrollable modal", { scrollable: true, size: "lg" }, true);
    }

    public openCustomDialog() {
        this.open("Custom dialog class", { modalDialogClass: "dialog" });
    }

    private open(title: string, options: NgbModalOptions, longContent = false) {
        this.modal.open(ModalDemoContentComponent, {
            ...options,
            bindings: {
                title,
                description: "These values are applied only to this modal instance.",
                longContent,
            },
        });
    }
}
`,u=`import { Component, Inject } from "ngjs-core";
import { ModalStackedContentComponent } from "@/features/modal/components/modal-stacked-content/modal-stacked-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-stacked",
    controllerAs: "example",
    templateUrl: "./modal-stacked.component.html",
    styleUrl: "./modal-stacked.component.css",
})
export class ModalStackedComponent {
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public async openStack() {
        for (let level = 1; level <= 3; level++) {
            await this.modal.open(ModalStackedContentComponent, {
                bindings: {
                    level,
                },
            });
        }
    }
}
`,d=`import { Component, Inject, Input } from "ngjs-core";
import { NgbModal, type NgbActiveModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-stacked-content",
    controllerAs: "$",
    templateUrl: "./modal-stacked-content.component.html",
    styleUrl: "./modal-stacked-content.component.css",
})
export class ModalStackedContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    @Input() level = 1;

    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public dismissAll() {
        this.modal.dismissAll("Dismiss all");
    }
}
`,f=`import { Component, Inject } from "ngjs-core";
import { ModalUpdatableContentComponent } from "@/features/modal/components/modal-updatable-content/modal-updatable-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-updatable",
    controllerAs: "example",
    templateUrl: "./modal-updatable.component.html",
    styleUrl: "./modal-updatable.component.css",
})
export class ModalUpdatableComponent {
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public open() {
        this.modal.open(ModalUpdatableContentComponent, {
            ariaLabelledBy: "updatable-modal-title",
            ariaDescribedBy: "updatable-modal-description",
            size: "sm",
        });
    }
}
`,p=`import { Component, Input } from "ngjs-core";
import type { NgbActiveModal, NgbModalUpdatableOptions } from "ngb-js/modal";

@Component({
    selector: "docs-modal-updatable-content",
    controllerAs: "$",
    templateUrl: "./modal-updatable-content.component.html",
    styleUrl: "./modal-updatable-content.component.css",
})
export class ModalUpdatableContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    public ariaReferences = true;
    public centered = false;
    public fullscreen = false;
    public customBackdrop = false;
    public size: NgbModalUpdatableOptions["size"] = "sm";
    public customWindow = false;
    public customDialog = false;

    public toggleAriaReferences() {
        this.ariaReferences = !this.ariaReferences;
        this.ngbActiveModal.update({
            ariaLabelledBy: this.ariaReferences ? "updatable-modal-title" : "",
            ariaDescribedBy: this.ariaReferences ? "updatable-modal-description" : "",
        });
    }

    public toggleCentered() {
        this.centered = !this.centered;
        this.ngbActiveModal.update({ centered: this.centered });
    }

    public toggleFullscreen() {
        this.fullscreen = !this.fullscreen;
        this.ngbActiveModal.update({ fullscreen: this.fullscreen });
    }

    public toggleBackdropClass() {
        this.customBackdrop = !this.customBackdrop;
        this.ngbActiveModal.update({ backdropClass: this.customBackdrop ? "updated-backdrop" : "" });
    }

    public cycleSize() {
        const sizes: Array<NgbModalUpdatableOptions["size"]> = ["sm", "lg", "xl"];
        this.size = sizes[(sizes.indexOf(this.size) + 1) % sizes.length];
        this.ngbActiveModal.update({ size: this.size });
    }

    public toggleWindowClass() {
        this.customWindow = !this.customWindow;
        this.ngbActiveModal.update({ windowClass: this.customWindow ? "updated-window" : "" });
    }

    public toggleDialogClass() {
        this.customDialog = !this.customDialog;
        this.ngbActiveModal.update({ modalDialogClass: this.customDialog ? "updated-dialog" : "" });
    }
}
`,m=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open default modal</button>

<ng-template ng-ref="content" let-close="close" let-dismiss="dismiss">
    <div class="modal-header">
        <h2 class="modal-title fs-5">Default modal</h2>
        <button type="button" class="btn-close" aria-label="Close" ng-click="dismiss('header close')"></button>
    </div>
    <div class="modal-body">
        <p class="mb-0">This modal uses the global defaults without passing local options.</p>
    </div>
    <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" ng-click="dismiss('cancel')">Cancel</button>
        <button type="button" class="btn btn-primary" ng-click="close('accepted')">Continue</button>
    </div>
</ng-template>
`,h=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open component modal</button>
<p class="small text-body-secondary mt-2 mb-0">{{ example.lastResult }}</p>
`,g=`<div class="modal-header">
    <h2 class="modal-title fs-5">{{ $.title }}</h2>
    <button
        type="button"
        class="btn-close"
        aria-label="Close"
        ng-click="$.ngbActiveModal.dismiss('header close')">
    </button>
</div>

<div class="modal-body">
    <p ng-class="{ 'mb-0': !$.longContent }">{{ $.description }}</p>

    <div class="list-group" ng-if="$.longContent">
        <div class="list-group-item" ng-repeat="item in $.items track by $index">{{ item }}</div>
    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-outline-secondary" ng-click="$.ngbActiveModal.dismiss('cancel')">
        Cancel
    </button>
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close('accepted')">
        Continue
    </button>
</div>
`,_=`<p class="text-body-secondary">
    The first focusable element receives focus by default. Add <code>ngbAutofocus</code> to choose another target.
</p>

<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-primary" ng-click="example.openDefaultFocus()">
        Focus first element
    </button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomFocus()">
        Use ngbAutofocus
    </button>
</div>
`,v=`<div class="modal-header">
    <h2 class="modal-title fs-5" id="modal-focus-title">Focus management</h2>
</div>

<div class="modal-body">
    <div class="mb-3">
        <label class="form-label" for="modal-first-focusable">First focusable element</label>
        <input id="modal-first-focusable" type="text" class="form-control" placeholder="Focused by default">
    </div>

    <div ng-if="$.autofocus">
        <label class="form-label" for="modal-custom-autofocus">Custom autofocus target</label>
        <input
            id="modal-custom-autofocus"
            type="text"
            class="form-control"
            placeholder="Focused through ngbAutofocus"
            ngbAutofocus>
    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Done</button>
</div>
`,y=`<div class="d-flex flex-wrap gap-2">
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomWindow()">Custom class</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openStaticBackdrop()">Static backdrop</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openSmall()">Small</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openLarge()">Large</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openExtraLarge()">Extra large</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openFullscreen()">Fullscreen</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCentered()">Vertically centered</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openScrollable()">Scrollable content</button>
    <button type="button" class="btn btn-outline-primary" ng-click="example.openCustomDialog()">Dialog custom class</button>
</div>
`,b=`<button type="button" class="btn btn-primary" ng-click="example.open()">Open updatable modal</button>
`,x=`<div class="modal-header">
    <h2 class="modal-title fs-5" id="updatable-modal-title">Updatable options</h2>
    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('close')"></button>
</div>

<div class="modal-body">
    <p id="updatable-modal-description">
        Change the window, dialog, backdrop and accessibility options while this modal remains open.
    </p>

    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleAriaReferences()">
            ARIA references: {{ $.ariaReferences ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleCentered()">
            Centered: {{ $.centered ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleFullscreen()">
            Fullscreen: {{ $.fullscreen ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleBackdropClass()">
            Backdrop class: {{ $.customBackdrop ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.cycleSize()">
            Size: {{ $.size }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleWindowClass()">
            Window class: {{ $.customWindow ? 'on' : 'off' }}
        </button>
        <button type="button" class="btn btn-outline-primary btn-sm" ng-click="$.toggleDialogClass()">
            Dialog class: {{ $.customDialog ? 'on' : 'off' }}
        </button>
    </div>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Done</button>
</div>
`,S=`<button type="button" class="btn btn-primary" ng-click="example.openStack()">Open three modals</button>
`,C=`<div class="modal-header">
    <h2 class="modal-title fs-5">Stacked modal {{ $.level }}</h2>
    <button type="button" class="btn-close" aria-label="Close" ng-click="$.ngbActiveModal.dismiss('close')"></button>
</div>

<div class="modal-body">
    <p class="mb-0">This is modal layer {{ $.level }} of 3. Close it to return to the previous layer.</p>
</div>

<div class="modal-footer">
    <button type="button" class="btn btn-outline-danger" ng-click="$.dismissAll()">Dismiss all</button>
    <button type="button" class="btn btn-primary" ng-click="$.ngbActiveModal.close()">Close this modal</button>
</div>
`,w=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            Modals are large, vertically centered, use a static backdrop and ignore the Escape key.
            This documentation example restores the shared defaults immediately after opening.
        </p>
    </div>
</div>

<button type="button" class="btn btn-primary" ng-click="example.open()">Open globally configured modal</button>
`,T=class{examples={defaults:{html:m,typescript:r},componentContent:{html:`<!-- modal-component-content.component.html -->\n${h}\n\n<!-- modal-demo-content.component.html -->\n${g}`,typescript:`${n}\n\n// modal-demo-content.component.ts\n${i}`},focus:{html:`<!-- modal-focus.component.html -->\n${_}\n\n<!-- modal-focus-content.component.html -->\n${v}`,typescript:`${a}\n\n// modal-focus-content.component.ts\n${o}`},options:{html:y,typescript:l,css:c},updatable:{html:`<!-- modal-updatable.component.html -->\n${b}\n\n<!-- modal-updatable-content.component.html -->\n${x}`,typescript:`${f}\n\n// modal-updatable-content.component.ts\n${p}`,css:c},stacked:{html:`<!-- modal-stacked.component.html -->\n${S}\n\n<!-- modal-stacked-content.component.html -->\n${C}`,typescript:`${u}\n\n// modal-stacked-content.component.ts\n${d}`},global:{html:w,typescript:s}}};T=t([e({selector:`docs-modal-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/modal-examples-page.component-ae7ff5a0.html`,styleUrl:`./modal-examples-page.component.css`})],T);export{T as ModalExamplesPageComponent};