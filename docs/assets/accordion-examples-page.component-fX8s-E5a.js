import{d as e,f as t}from"./index-PqXhwIf1.js";var n=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-accordion-content",
    controllerAs: "example",
    templateUrl: "./accordion-content.component.html",
    styleUrl: "./accordion-content.component.css",
})
export class AccordionContentComponent {
    public draft = "This value remains after collapsing the panel.";
}
`,r=`import { Component, Inject, type OnDestroy } from "ngjs-core";
import { NgbAccordionConfig, NGB_ACCORDION_CONFIG } from "ngb-js/accordion/compat";

@Component({
    selector: "docs-accordion-global",
    controllerAs: "example",
    templateUrl: "./accordion-global.component.html",
    styleUrl: "./accordion-global.component.css",
})
export class AccordionGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbAccordionConfig, "animation" | "closeOthers" | "destroyOnHide">;

    constructor(@Inject(NGB_ACCORDION_CONFIG) private readonly config: NgbAccordionConfig) {
        this.initialConfig = {
            animation: config.animation,
            closeOthers: config.closeOthers,
            destroyOnHide: config.destroyOnHide,
        };

        config.animation = false;
        config.closeOthers = true;
        config.destroyOnHide = false;
    }

    public ngOnDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.closeOthers = this.initialConfig.closeOthers;
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;
    }
}
`,i=`import { Component, ViewChild } from "ngjs-core";

interface AccordionController {
    expandAll(): void;
    collapseAll(): void;
    toggle(itemId: string): void;
}

@Component({
    selector: "docs-accordion-toggle-panels",
    controllerAs: "example",
    templateUrl: "./accordion-toggle-panels.component.html",
    styleUrl: "./accordion-toggle-panels.component.css",
})
export class AccordionTogglePanelsComponent {
    @ViewChild("accordion", { static: true })
    private accordion!: AccordionController;

    public expandAll() {
        this.accordion.expandAll();
    }

    public collapseAll() {
        this.accordion.collapseAll();
    }

    public toggle(itemId: string) {
        this.accordion.toggle(itemId);
    }
}
`,a=`<ng-template ng-ref="templateHeader">
    <span class="d-inline-flex align-items-center gap-2">
        <i class="bi bi-stars text-primary" aria-hidden="true"></i>
        Header rendered from an ng-template
    </span>
</ng-template>

<div ngb-accordion animation="true" close-others="false" destroy-on-hide="true">
    <div ngb-accordion-item="'simple-first'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Regular header</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">This panel uses the standard accordion header and button.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'simple-template'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>
                <ng-container ng-template-outlet="templateHeader"></ng-container>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">The header content comes from a reusable AngularJS template.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'simple-disabled'" ng-disabled="true">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Disabled panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Disabled items ignore pointer and keyboard toggle actions.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`,o=`<div ngb-accordion animation="true" close-others="true" destroy-on-hide="true">
    <div ngb-accordion-item="'one-panel-first'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>First panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Opening another panel automatically collapses this one.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'one-panel-second'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Second panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0"><code>close-others</code> keeps only one item expanded.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'one-panel-third'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Third panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">The behavior is coordinated by the parent accordion.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`,s=`<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.expandAll()">Expand all</button>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.collapseAll()">Collapse all</button>
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle('toggle-first')">Toggle first</button>
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle('toggle-second')">Toggle second</button>
</div>

<div
    ngb-accordion
    animation="true"
    close-others="false"
    destroy-on-hide="true"
    ng-ref="accordion"
    ng-ref-read="ngbAccordion">
    <div ngb-accordion-item="'toggle-first'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>First panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">This panel can be controlled from its header or the buttons above.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'toggle-second'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Second panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Use the accordion controller to expand, collapse or toggle known ids.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`,c=`<div ngb-accordion animation="true" close-others="false" destroy-on-hide="true">
    <div ngb-accordion-item="'custom-profile'" collapsed="false">
        <h2 ngb-accordion-header>
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary p-2">
                    <i class="bi bi-person" aria-hidden="true"></i>
                </span>
                <span>
                    <span class="d-block fw-semibold">Profile</span>
                    <span class="d-block small fw-normal text-body-secondary">Personal information and public details</span>
                </span>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Custom headers can combine Bootstrap utilities, icons and supporting text.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'custom-preferences'">
        <h2 ngb-accordion-header>
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning-emphasis p-2">
                    <i class="bi bi-sliders" aria-hidden="true"></i>
                </span>
                <span>
                    <span class="d-block fw-semibold">Preferences</span>
                    <span class="d-block small fw-normal text-body-secondary">Language, appearance and notifications</span>
                </span>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">The toggle directive supplies behavior while Bootstrap classes define the presentation.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'custom-security'">
        <h2 ngb-accordion-header>
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success p-2">
                    <i class="bi bi-shield-lock" aria-hidden="true"></i>
                </span>
                <span>
                    <span class="d-block fw-semibold">Security</span>
                    <span class="d-block small fw-normal text-body-secondary">Password and active sessions</span>
                </span>
            </button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Use semantic buttons so custom headers remain keyboard accessible.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`,l=`<div ngb-accordion animation="true" close-others="false" destroy-on-hide="false">
    <div ngb-accordion-item="'persistent-content'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Persistent form content</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <label class="form-label" for="accordion-persistent-value">Draft value</label>
                    <input
                        id="accordion-persistent-value"
                        class="form-control"
                        type="text"
                        ng-model="example.draft">
                    <p class="small text-body-secondary mt-2 mb-0">
                        Edit the value, collapse the panel and open it again. The same view remains in the DOM.
                    </p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`,u=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            Animation is disabled, only one panel stays open and collapsed content remains in the DOM.
        </p>
    </div>
</div>

<div ngb-accordion>
    <div ngb-accordion-item="'global-first'" collapsed="false">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>First panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">This accordion receives its behavior from <code>NgbAccordionConfig</code>.</p>
                </ng-template>
            </div>
        </div>
    </div>

    <div ngb-accordion-item="'global-second'">
        <h2 ngb-accordion-header>
            <button ngb-accordion-button>Second panel</button>
        </h2>
        <div ngb-accordion-collapse>
            <div ngb-accordion-body>
                <ng-template>
                    <p class="mb-0">Opening this item collapses the first without local accordion inputs.</p>
                </ng-template>
            </div>
        </div>
    </div>
</div>
`,d=class{examples={simple:{html:a},onePanel:{html:o},togglePanels:{html:s,typescript:i},customHeader:{html:c},content:{html:l,typescript:n},global:{html:u,typescript:r}}};d=e([t({selector:`docs-accordion-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/accordion-examples-page.component-20b7b46b.html`,styleUrl:`./accordion-examples-page.component.css`})],d);export{d as AccordionExamplesPageComponent};