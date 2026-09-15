import{r as e,t}from"./decorate-U3LoYfOr.js";var n=`<div class="toast-container position-static">\r
    <ngb-toast ng-if="example.visible" header="Close me" autohide="false" hidden="example.close()">\r
        Use the close button in the header. This toast will return after three seconds.\r
    </ngb-toast>\r
\r
    <div ng-if="!example.visible" class="alert alert-light border mb-0" role="status">\r
        The toast will be back shortly.\r
    </div>\r
</div>\r
`,r=`import { Component, type OnDestroy } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-closeable-toast",\r
    controllerAs: "example",\r
    templateUrl: "./closeable-toast.component.html",\r
    styleUrl: "./closeable-toast.component.css",\r
})\r
export class CloseableToastComponent implements OnDestroy {\r
    public visible = true;\r
    private reopenTimer?: ReturnType<typeof setTimeout>;\r
\r
    public close(): void {\r
        this.visible = false;\r
        this.reopenTimer = setTimeout(() => {\r
            this.visible = true;\r
        }, 3000);\r
    }\r
\r
    public ngOnDestroy(): void {\r
        if (this.reopenTimer) clearTimeout(this.reopenTimer);\r
    }\r
}\r
`,i=`<div class="toast-container position-static d-flex flex-column gap-3">\r
    <div>\r
        <h3 class="h6">Body only</h3>\r
        <ngb-toast autohide="false">I am a simple static toast.</ngb-toast>\r
    </div>\r
\r
    <div>\r
        <h3 class="h6">With a text header</h3>\r
        <ngb-toast ng-if="example.showHeaderToast" header="Hello" autohide="false" hidden="example.showHeaderToast = false">\r
            I am a simple static toast with a header.\r
        </ngb-toast>\r
        <button ng-if="!example.showHeaderToast" type="button" class="btn btn-sm btn-outline-primary" ng-click="example.showHeaderToast = true">\r
            Show toast again\r
        </button>\r
    </div>\r
</div>\r
`,a=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-inline-toast",\r
    controllerAs: "example",\r
    templateUrl: "./inline-toast.component.html",\r
    styleUrl: "./inline-toast.component.css",\r
})\r
export class InlineToastComponent {\r
    public showHeaderToast = true;\r
}\r
`,o=`<div class="d-flex flex-wrap gap-2 mb-3">\r
    <button type="button" class="btn btn-primary" ng-click="example.showStandard()">Standard</button>\r
    <button type="button" class="btn btn-success" ng-click="example.showSuccess()">Success</button>\r
    <button type="button" class="btn btn-danger" ng-click="example.showDanger()">Danger</button>\r
    <button type="button" class="btn btn-outline-secondary" ng-click="example.toastService.clear()" ng-disabled="!example.toastService.toasts.length">Clear all</button>\r
</div>\r
\r
<div class="toast-container position-static d-flex flex-column gap-2" aria-live="polite" aria-atomic="true">\r
    <ngb-toast\r
        ng-repeat="toast in example.toastService.toasts track by toast.id"\r
        class="{{ toast.className }}"\r
        autohide="true"\r
        delay="toast.delay || 5000"\r
        hidden="example.toastService.remove(toast)">\r
        {{ toast.body }}\r
    </ngb-toast>\r
\r
    <p ng-if="!example.toastService.toasts.length" class="small text-body-secondary mb-0">No active toasts.</p>\r
</div>\r
`,s=`import { Component, Injectable, type OnDestroy } from "ngjs-core";\r
\r
interface ManagedToast {\r
    id: number;\r
    body: string;\r
    className?: string;\r
    delay?: number;\r
}\r
\r
@Injectable({ id: "docs.toast.service" })\r
export class DocsToastService {\r
    public readonly toasts: ManagedToast[] = [];\r
    private nextId = 0;\r
\r
    public show(body: string, options: Omit<ManagedToast, "id" | "body"> = {}): void {\r
        this.toasts.push({ id: ++this.nextId, body, ...options });\r
    }\r
\r
    public remove(toast: ManagedToast): void {\r
        const index = this.toasts.indexOf(toast);\r
        if (index >= 0) this.toasts.splice(index, 1);\r
    }\r
\r
    public clear(): void {\r
        this.toasts.length = 0;\r
    }\r
}\r
\r
@Component({\r
    selector: "docs-toast-management",\r
    controllerAs: "example",\r
    templateUrl: "./toast-management.component.html",\r
    styleUrl: "./toast-management.component.css",\r
})\r
export class ToastManagementComponent implements OnDestroy {\r
    constructor(public readonly toastService: DocsToastService) {}\r
\r
    public showStandard(): void {\r
        this.toastService.show("I am a standard toast.");\r
    }\r
\r
    public showSuccess(): void {\r
        this.toastService.show("Your changes were saved.", { className: "bg-success text-white", delay: 8000 });\r
    }\r
\r
    public showDanger(): void {\r
        this.toastService.show("The operation could not be completed.", { className: "bg-danger text-white", delay: 10000 });\r
    }\r
\r
    public ngOnDestroy(): void {\r
        this.toastService.clear();\r
    }\r
}\r
`,c=`<p>Show the toast and keep the pointer over it to pause autohide.</p>\r
\r
<button type="button" class="btn btn-primary mb-3" ng-click="example.show()">Show toast</button>\r
\r
<div class="toast-container position-static">\r
    <ngb-toast\r
        ng-if="example.visible"\r
        header="Autohide can be paused"\r
        delay="5000"\r
        autohide="example.autohide"\r
        hidden="example.hide()"\r
        ng-mouseenter="example.autohide = false"\r
        ng-mouseleave="example.autohide = true"\r
        ng-class="{ 'border-warning': !example.autohide }">\r
        {{ example.autohide ? 'Hover over me before five seconds pass.' : 'Paused. I will remain visible until you leave.' }}\r
    </ngb-toast>\r
</div>\r
`,l=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-prevent-autohide-toast",\r
    controllerAs: "example",\r
    templateUrl: "./prevent-autohide-toast.component.html",\r
    styleUrl: "./prevent-autohide-toast.component.css",\r
})\r
export class PreventAutohideToastComponent {\r
    public visible = false;\r
    public autohide = true;\r
\r
    public show(): void {\r
        this.visible = false;\r
        this.autohide = true;\r
        setTimeout(() => this.visible = true);\r
    }\r
\r
    public hide(): void {\r
        this.visible = false;\r
        this.autohide = true;\r
    }\r
}\r
`,u=`<div class="toast-container position-static">\r
    <ngb-toast ng-if="example.visible" autohide="false" hidden="example.visible = false">\r
        <ng-template ngb-toast-header>\r
            <div class="d-flex align-items-center gap-2 me-auto">\r
                <i class="bi bi-stars text-primary" aria-hidden="true"></i>\r
                <strong>Custom header</strong>\r
                <small class="text-body-secondary">just now</small>\r
            </div>\r
        </ng-template>\r
        The complete header is rendered from an <code>ng-template</code>.\r
    </ngb-toast>\r
\r
    <button ng-if="!example.visible" type="button" class="btn btn-sm btn-outline-primary" ng-click="example.visible = true">\r
        Show toast again\r
    </button>\r
</div>\r
`,d=`import { Component } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-template-header-toast",\r
    controllerAs: "example",\r
    templateUrl: "./template-header-toast.component.html",\r
    styleUrl: "./template-header-toast.component.css",\r
})\r
export class TemplateHeaderToastComponent {\r
    public visible = true;\r
}\r
`,f=class{examples={inline:{html:i,typescript:a},templateHeader:{html:u,typescript:d},closeable:{html:n,typescript:r},preventAutohide:{html:c,typescript:l},management:{html:o,typescript:s}}};f=t([e({selector:`docs-toast-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/toast-examples-page.component-24384b8b.html`,styleUrl:`./toast-examples-page.component.css`})],f);export{f as ToastExamplesPageComponent};