import{d as e,f as t}from"./index-B9XAkpig.js";var n=`import { Component } from "ngjs-core";

interface AlertExample {
    id: number;
    type: string;
    message: string;
    animation: boolean;
}

const createAlerts = (): AlertExample[] => [
    { id: 1, type: "success", message: "Your changes were saved successfully.", animation: true },
    { id: 2, type: "danger", message: "Something needs your attention.", animation: true },
    { id: 3, type: "warning", message: "This alert closes without animation.", animation: false },
    { id: 4, type: "info", message: "This one also closes immediately.", animation: false },
];

@Component({
    selector: "docs-alert-closeable",
    controllerAs: "example",
    templateUrl: "./alert-closeable.component.html",
    styleUrl: "./alert-closeable.component.css",
})
export class AlertCloseableComponent {
    public alerts = createAlerts();

    public close(id: number) {
        this.alerts = this.alerts.filter((alert) => alert.id !== id);
    }

    public reset() {
        this.alerts = createAlerts();
    }
}
`,r=`.alert-custom { --bs-alert-color: var(--bs-emphasis-color); --bs-alert-bg: color-mix(in srgb, var(--bs-primary-bg-subtle) 45%, var(--bs-body-bg)); --bs-alert-border-color: var(--bs-primary-border-subtle); --bs-alert-link-color: var(--bs-primary-text-emphasis); border-left: .3rem solid var(--bs-primary); box-shadow: 0 .75rem 2rem rgba(var(--bs-primary-rgb), .08); }\r
.alert-custom .bi { color: var(--bs-primary); }\r
.alert-custom code { color: var(--ngbjs-code-color); }\r
`,i=`import { Component, Inject, type OnDestroy } from "ngjs-core";
import { NgbAlertConfig, NGB_ALERT_CONFIG } from "ngb-js/alert/compat";

@Component({
    selector: "docs-alert-global",
    controllerAs: "example",
    templateUrl: "./alert-global.component.html",
    styleUrl: "./alert-global.component.css",
})
export class AlertGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbAlertConfig, "animation" | "dismissible" | "type">;

    constructor(@Inject(NGB_ALERT_CONFIG) private readonly config: NgbAlertConfig) {
        this.initialConfig = {
            animation: config.animation,
            dismissible: config.dismissible,
            type: config.type,
        };

        config.animation = false;
        config.dismissible = false;
        config.type = "success";
    }

    public ngOnDestroy() {
        this.config.animation = this.initialConfig.animation;
        this.config.dismissible = this.initialConfig.dismissible;
        this.config.type = this.initialConfig.type;
    }
}
`,a=`import type { INgbAlert } from "ngb-js/alert";
import { Component, type OnDestroy, type OnInit, ViewChild } from "ngjs-core";

@Component({
    selector: "docs-self-closing-alert",
    controllerAs: "example",
    templateUrl: "./self-closing-alert.component.html",
    styleUrl: "./self-closing-alert.component.css",
})
export class SelfClosingAlertComponent implements OnInit, OnDestroy {
    private readonly initialSeconds = 5;
    private timer?: ReturnType<typeof setTimeout>;

    @ViewChild("alert")
    private alert?: INgbAlert;

    public remaining = this.initialSeconds;
    public visible = true;

    public ngOnInit() {
        this.startTimer();
    }

    public ngOnDestroy() {
        this.cancelTimer();
    }

    public restart() {
        this.cancelTimer();
        this.remaining = this.initialSeconds;
        this.visible = true;
        this.startTimer();
    }

    public onClosed() {
        this.visible = false;
        this.cancelTimer();
    }

    private startTimer() {
        this.timer = setTimeout(() => {
            this.remaining--;

            if (this.remaining <= 0) {
                if (this.alert) {
                    this.alert.close();
                } else {
                    this.visible = false;
                }
                return;
            }

            this.startTimer();
        }, 1000);
    }

    private cancelTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
}
`,o=`<ngb-alert type="primary" dismissible="false" animation="false">
    <strong>Heads up!</strong> This is a simple alert rendered with NgbJS.
</ngb-alert>
`,s=`<div class="d-flex justify-content-end mb-3">
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.reset()">
        <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
        Reset alerts
    </button>
</div>

<ngb-alert
    ng-repeat="alert in example.alerts track by alert.id"
    type="{{ alert.type }}"
    dismissible="true"
    animation="alert.animation"
    closed="example.close(alert.id)">
    {{ alert.message }}
    <span class="small opacity-75">{{ alert.animation ? 'Animated' : 'No animation' }}</span>
</ngb-alert>

<p class="text-body-secondary mb-0" ng-if="!example.alerts.length">
    All alerts have been closed.
</p>
`,c=`<div class="d-flex align-items-center justify-content-between gap-3 mb-3">
    <p class="small text-body-secondary mb-0">
        {{ example.visible ? 'The timer is running.' : 'The alert is closed.' }}
    </p>
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.restart()">
        <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>
        {{ example.visible ? 'Restart timer' : 'Show again' }}
    </button>
</div>

<ngb-alert
    ng-if="example.visible"
    ng-ref="alert"
    ng-ref-read="ngbAlert"
    type="info"
    dismissible="true"
    animation="true"
    closed="example.onClosed()">
    This alert will close automatically in
    <strong>{{ example.remaining }} {{ example.remaining === 1 ? 'second' : 'seconds' }}</strong>.
</ngb-alert>
`,l=`<ngb-alert type="custom" dismissible="false" animation="false">
    <div class="d-flex align-items-start gap-3">
        <i class="bi bi-lightning-charge-fill fs-4 text-primary" aria-hidden="true"></i>
        <div>
            <h3 class="h6 mb-1">Custom alert</h3>
            <p class="mb-0">The <code>.alert-custom</code> class defines this theme without changing NgbJS.</p>
        </div>
    </div>
</ngb-alert>
`,u=`<div class="alert alert-light border d-flex align-items-start gap-3" role="note">
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>
    <div>
        <p class="fw-semibold mb-1">Global defaults used by this example</p>
        <p class="small text-body-secondary mb-0">
            The default type is success, animations are disabled and alerts are not dismissible.
        </p>
    </div>
</div>

<ngb-alert>
    This alert has no local inputs. Its appearance and behavior come from <code>NgbAlertConfig</code>.
</ngb-alert>
`,d=class{examples={simple:{html:o},closeable:{html:s,typescript:n},selfClosing:{html:c,typescript:a},custom:{html:l,css:r},global:{html:u,typescript:i}}};d=e([t({selector:`docs-alert-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/alert-examples-page.component-6650b4b6.html`,styleUrl:`./alert-examples-page.component.css`})],d);export{d as AlertExamplesPageComponent};