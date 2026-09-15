import{r as e,t}from"./decorate-DwQZkZoC.js";var n=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-accordion-content",\r
    controllerAs: "example",\r
    templateUrl: "accordion-content.component.html",\r
    styleUrl: "./accordion-content.component.css",\r
})\r
export class AccordionContentComponent {\r
    public draft = "This value remains after collapsing the panel.";\r
}\r
`,r=`import { Component, Inject, type OnDestroy } from "ngjs-core";\r
import { NgbAccordionConfig, NGB_ACCORDION_CONFIG } from "ngb-js/accordion/compat";\r
\r
@Component({\r
    selector: "docs-accordion-global",\r
    controllerAs: "example",\r
    templateUrl: "accordion-global.component.html",\r
    styleUrl: "./accordion-global.component.css",\r
})\r
export class AccordionGlobalComponent implements OnDestroy {\r
    private readonly initialConfig: Pick<NgbAccordionConfig, "animation" | "closeOthers" | "destroyOnHide">;\r
\r
    constructor(@Inject(NGB_ACCORDION_CONFIG) private readonly config: NgbAccordionConfig) {\r
        this.initialConfig = {\r
            animation: config.animation,\r
            closeOthers: config.closeOthers,\r
            destroyOnHide: config.destroyOnHide,\r
        };\r
\r
        config.animation = false;\r
        config.closeOthers = true;\r
        config.destroyOnHide = false;\r
    }\r
\r
    public ngOnDestroy() {\r
        this.config.animation = this.initialConfig.animation;\r
        this.config.closeOthers = this.initialConfig.closeOthers;\r
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;\r
    }\r
}\r
`,i=`import { Component, ViewChild } from "ngjs-core";\r
\r
interface AccordionController {\r
    expandAll(): void;\r
    collapseAll(): void;\r
    toggle(itemId: string): void;\r
}\r
\r
@Component({\r
    selector: "docs-accordion-toggle-panels",\r
    controllerAs: "example",\r
    templateUrl: "accordion-toggle-panels.component.html",\r
    styleUrl: "./accordion-toggle-panels.component.css",\r
})\r
export class AccordionTogglePanelsComponent {\r
    @ViewChild("accordion", { static: true })\r
    private accordion!: AccordionController;\r
\r
    public expandAll() {\r
        this.accordion.expandAll();\r
    }\r
\r
    public collapseAll() {\r
        this.accordion.collapseAll();\r
    }\r
\r
    public toggle(itemId: string) {\r
        this.accordion.toggle(itemId);\r
    }\r
}\r
`,a=`<ng-template ng-ref="templateHeader">\r
    <span class="d-inline-flex align-items-center gap-2">\r
        <i class="bi bi-stars text-primary" aria-hidden="true"></i>\r
        Header rendered from an ng-template\r
    </span>\r
</ng-template>\r
\r
<div ngb-accordion animation="true" close-others="false" destroy-on-hide="true">\r
    <div ngb-accordion-item="'simple-first'" collapsed="false">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>Regular header</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">This panel uses the standard accordion header and button.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'simple-template'">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>\r
                <ng-container ng-template-outlet="templateHeader"></ng-container>\r
            </button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">The header content comes from a reusable AngularJS template.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'simple-disabled'" ng-disabled="true">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>Disabled panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">Disabled items ignore pointer and keyboard toggle actions.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
</div>\r
`,o=`<div ngb-accordion animation="true" close-others="true" destroy-on-hide="true">\r
    <div ngb-accordion-item="'one-panel-first'" collapsed="false">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>First panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">Opening another panel automatically collapses this one.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'one-panel-second'">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>Second panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0"><code>close-others</code> keeps only one item expanded.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'one-panel-third'">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>Third panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">The behavior is coordinated by the parent accordion.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
</div>\r
`,s=`<div class="d-flex flex-wrap gap-2 mb-3">\r
    <button type="button" class="btn btn-primary btn-sm" ng-click="example.expandAll()">Expand all</button>\r
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.collapseAll()">Collapse all</button>\r
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle('toggle-first')">Toggle first</button>\r
    <button type="button" class="btn btn-outline-secondary btn-sm" ng-click="example.toggle('toggle-second')">Toggle second</button>\r
</div>\r
\r
<div\r
    ngb-accordion\r
    animation="true"\r
    close-others="false"\r
    destroy-on-hide="true"\r
    ng-ref="accordion"\r
    ng-ref-read="ngbAccordion">\r
    <div ngb-accordion-item="'toggle-first'">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>First panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">This panel can be controlled from its header or the buttons above.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'toggle-second'">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>Second panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">Use the accordion controller to expand, collapse or toggle known ids.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
</div>\r
`,c=`<div ngb-accordion animation="true" close-others="false" destroy-on-hide="true">\r
    <div ngb-accordion-item="'custom-profile'" collapsed="false">\r
        <h2 ngb-accordion-header>\r
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>\r
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary p-2">\r
                    <i class="bi bi-person" aria-hidden="true"></i>\r
                </span>\r
                <span>\r
                    <span class="d-block fw-semibold">Profile</span>\r
                    <span class="d-block small fw-normal text-body-secondary">Personal information and public details</span>\r
                </span>\r
            </button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">Custom headers can combine Bootstrap utilities, icons and supporting text.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'custom-preferences'">\r
        <h2 ngb-accordion-header>\r
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>\r
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning-emphasis p-2">\r
                    <i class="bi bi-sliders" aria-hidden="true"></i>\r
                </span>\r
                <span>\r
                    <span class="d-block fw-semibold">Preferences</span>\r
                    <span class="d-block small fw-normal text-body-secondary">Language, appearance and notifications</span>\r
                </span>\r
            </button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">The toggle directive supplies behavior while Bootstrap classes define the presentation.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'custom-security'">\r
        <h2 ngb-accordion-header>\r
            <button type="button" class="accordion-button d-flex align-items-center gap-3" ngb-accordion-toggle>\r
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success p-2">\r
                    <i class="bi bi-shield-lock" aria-hidden="true"></i>\r
                </span>\r
                <span>\r
                    <span class="d-block fw-semibold">Security</span>\r
                    <span class="d-block small fw-normal text-body-secondary">Password and active sessions</span>\r
                </span>\r
            </button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">Use semantic buttons so custom headers remain keyboard accessible.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
</div>\r
`,l=`<div ngb-accordion animation="true" close-others="false" destroy-on-hide="false">\r
    <div ngb-accordion-item="'persistent-content'" collapsed="false">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>Persistent form content</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <label class="form-label" for="accordion-persistent-value">Draft value</label>\r
                    <input\r
                        id="accordion-persistent-value"\r
                        class="form-control"\r
                        type="text"\r
                        ng-model="example.draft">\r
                    <p class="small text-body-secondary mt-2 mb-0">\r
                        Edit the value, collapse the panel and open it again. The same view remains in the DOM.\r
                    </p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
</div>\r
`,u=`<div class="alert alert-light border d-flex gap-3 align-items-start" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            Animation is disabled, only one panel stays open and collapsed content remains in the DOM.\r
        </p>\r
    </div>\r
</div>\r
\r
<div ngb-accordion>\r
    <div ngb-accordion-item="'global-first'" collapsed="false">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>First panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">This accordion receives its behavior from <code>NgbAccordionConfig</code>.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <div ngb-accordion-item="'global-second'">\r
        <h2 ngb-accordion-header>\r
            <button ngb-accordion-button>Second panel</button>\r
        </h2>\r
        <div ngb-accordion-collapse>\r
            <div ngb-accordion-body>\r
                <ng-template>\r
                    <p class="mb-0">Opening this item collapses the first without local accordion inputs.</p>\r
                </ng-template>\r
            </div>\r
        </div>\r
    </div>\r
</div>\r
`,d=class{examples={simple:{html:a},onePanel:{html:o},togglePanels:{html:s,typescript:i},customHeader:{html:c},content:{html:l,typescript:n},global:{html:u,typescript:r}}};d=t([e({selector:`docs-accordion-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/accordion-examples-page.component-1afd8260.html`,styleUrl:`./accordion-examples-page.component.css`})],d);export{d as AccordionExamplesPageComponent};