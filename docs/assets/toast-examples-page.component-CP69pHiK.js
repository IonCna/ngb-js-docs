import{d as e,f as t}from"./index-PqXhwIf1.js";var n=`<div class="toast-container position-static">
    <ngb-toast ng-if="example.visible" header="Close me" autohide="false" hidden="example.close()">
        Use the close button in the header. This toast will return after three seconds.
    </ngb-toast>

    <div ng-if="!example.visible" class="alert alert-light border mb-0" role="status">
        The toast will be back shortly.
    </div>
</div>
`,r=`import { Component, type OnDestroy } from "ngjs-core";

@Component({
    selector: "docs-closeable-toast",
    controllerAs: "example",
    templateUrl: "./closeable-toast.component.html",
    styleUrl: "./closeable-toast.component.css",
})
export class CloseableToastComponent implements OnDestroy {
    public visible = true;
    private reopenTimer?: ReturnType<typeof setTimeout>;

    public close(): void {
        this.visible = false;
        this.reopenTimer = setTimeout(() => {
            this.visible = true;
        }, 3000);
    }

    public ngOnDestroy(): void {
        if (this.reopenTimer) clearTimeout(this.reopenTimer);
    }
}
`,i=`<div class="toast-container position-static d-flex flex-column gap-3">
    <div>
        <h3 class="h6">Body only</h3>
        <ngb-toast autohide="false">I am a simple static toast.</ngb-toast>
    </div>

    <div>
        <h3 class="h6">With a text header</h3>
        <ngb-toast ng-if="example.showHeaderToast" header="Hello" autohide="false" hidden="example.showHeaderToast = false">
            I am a simple static toast with a header.
        </ngb-toast>
        <button ng-if="!example.showHeaderToast" type="button" class="btn btn-sm btn-outline-primary" ng-click="example.showHeaderToast = true">
            Show toast again
        </button>
    </div>
</div>
`,a=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-inline-toast",
    controllerAs: "example",
    templateUrl: "./inline-toast.component.html",
    styleUrl: "./inline-toast.component.css",
})
export class InlineToastComponent {
    public showHeaderToast = true;
}
`,o=`<div class="d-flex flex-wrap gap-2 mb-3">
    <button type="button" class="btn btn-primary" ng-click="example.showStandard()">Standard</button>
    <button type="button" class="btn btn-success" ng-click="example.showSuccess()">Success</button>
    <button type="button" class="btn btn-danger" ng-click="example.showDanger()">Danger</button>
    <button type="button" class="btn btn-outline-secondary" ng-click="example.toastService.clear()" ng-disabled="!example.toastService.toasts.length">Clear all</button>
</div>

<div class="toast-container position-static d-flex flex-column gap-2" aria-live="polite" aria-atomic="true">
    <ngb-toast
        ng-repeat="toast in example.toastService.toasts track by toast.id"
        class="{{ toast.className }}"
        autohide="true"
        delay="toast.delay || 5000"
        hidden="example.toastService.remove(toast)">
        {{ toast.body }}
    </ngb-toast>

    <p ng-if="!example.toastService.toasts.length" class="small text-body-secondary mb-0">No active toasts.</p>
</div>
`,s=`import { Component, Injectable, type OnDestroy } from "ngjs-core";

interface ManagedToast {
    id: number;
    body: string;
    className?: string;
    delay?: number;
}

@Injectable({ id: "docs.toast.service" })
export class DocsToastService {
    public readonly toasts: ManagedToast[] = [];
    private nextId = 0;

    public show(body: string, options: Omit<ManagedToast, "id" | "body"> = {}): void {
        this.toasts.push({ id: ++this.nextId, body, ...options });
    }

    public remove(toast: ManagedToast): void {
        const index = this.toasts.indexOf(toast);
        if (index >= 0) this.toasts.splice(index, 1);
    }

    public clear(): void {
        this.toasts.length = 0;
    }
}

@Component({
    selector: "docs-toast-management",
    controllerAs: "example",
    templateUrl: "./toast-management.component.html",
    styleUrl: "./toast-management.component.css",
})
export class ToastManagementComponent implements OnDestroy {
    constructor(public readonly toastService: DocsToastService) {}

    public showStandard(): void {
        this.toastService.show("I am a standard toast.");
    }

    public showSuccess(): void {
        this.toastService.show("Your changes were saved.", { className: "bg-success text-white", delay: 8000 });
    }

    public showDanger(): void {
        this.toastService.show("The operation could not be completed.", { className: "bg-danger text-white", delay: 10000 });
    }

    public ngOnDestroy(): void {
        this.toastService.clear();
    }
}
`,c=`<p>Show the toast and keep the pointer over it to pause autohide.</p>

<button type="button" class="btn btn-primary mb-3" ng-click="example.show()">Show toast</button>

<div class="toast-container position-static">
    <ngb-toast
        ng-if="example.visible"
        header="Autohide can be paused"
        delay="5000"
        autohide="example.autohide"
        hidden="example.hide()"
        ng-mouseenter="example.autohide = false"
        ng-mouseleave="example.autohide = true"
        ng-class="{ 'border-warning': !example.autohide }">
        {{ example.autohide ? 'Hover over me before five seconds pass.' : 'Paused. I will remain visible until you leave.' }}
    </ngb-toast>
</div>
`,l=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-prevent-autohide-toast",
    controllerAs: "example",
    templateUrl: "./prevent-autohide-toast.component.html",
    styleUrl: "./prevent-autohide-toast.component.css",
})
export class PreventAutohideToastComponent {
    public visible = false;
    public autohide = true;

    public show(): void {
        this.visible = false;
        this.autohide = true;
        setTimeout(() => this.visible = true);
    }

    public hide(): void {
        this.visible = false;
        this.autohide = true;
    }
}
`,u=`<div class="toast-container position-static">
    <ngb-toast ng-if="example.visible" autohide="false" hidden="example.visible = false">
        <ng-template ngb-toast-header>
            <div class="d-flex align-items-center gap-2 me-auto">
                <i class="bi bi-stars text-primary" aria-hidden="true"></i>
                <strong>Custom header</strong>
                <small class="text-body-secondary">just now</small>
            </div>
        </ng-template>
        The complete header is rendered from an <code>ng-template</code>.
    </ngb-toast>

    <button ng-if="!example.visible" type="button" class="btn btn-sm btn-outline-primary" ng-click="example.visible = true">
        Show toast again
    </button>
</div>
`,d=`import { Component } from "ngjs-core";

@Component({
    selector: "docs-template-header-toast",
    controllerAs: "example",
    templateUrl: "./template-header-toast.component.html",
    styleUrl: "./template-header-toast.component.css",
})
export class TemplateHeaderToastComponent {
    public visible = true;
}
`,f=class{examples={inline:{html:i,typescript:a},templateHeader:{html:u,typescript:d},closeable:{html:n,typescript:r},preventAutohide:{html:c,typescript:l},management:{html:o,typescript:s}}};f=e([t({selector:`docs-toast-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/toast-examples-page.component-e525e85b.html`,styleUrl:`./toast-examples-page.component.css`})],f);export{f as ToastExamplesPageComponent};