import{r as e,t}from"./decorate-qfgSl2U_.js";var n=`import { Component } from "ngjs-core";\r
\r
interface AlertExample {\r
    id: number;\r
    type: string;\r
    message: string;\r
    animation: boolean;\r
}\r
\r
const createAlerts = (): AlertExample[] => [\r
    { id: 1, type: "success", message: "Your changes were saved successfully.", animation: true },\r
    { id: 2, type: "danger", message: "Something needs your attention.", animation: true },\r
    { id: 3, type: "warning", message: "This alert closes without animation.", animation: false },\r
    { id: 4, type: "info", message: "This one also closes immediately.", animation: false },\r
];\r
\r
@Component({\r
    selector: "docs-alert-closeable",\r
    controllerAs: "example",\r
    templateUrl: "./alert-closeable.component.html",\r
    styleUrl: "./alert-closeable.component.css",\r
})\r
export class AlertCloseableComponent {\r
    public alerts = createAlerts();\r
\r
    public close(id: number) {\r
        this.alerts = this.alerts.filter((alert) => alert.id !== id);\r
    }\r
\r
    public reset() {\r
        this.alerts = createAlerts();\r
    }\r
}\r
`,r=`.alert-custom { --bs-alert-color: var(--bs-emphasis-color); --bs-alert-bg: color-mix(in srgb, var(--bs-primary-bg-subtle) 45%, var(--bs-body-bg)); --bs-alert-border-color: var(--bs-primary-border-subtle); --bs-alert-link-color: var(--bs-primary-text-emphasis); border-left: .3rem solid var(--bs-primary); box-shadow: 0 .75rem 2rem rgba(var(--bs-primary-rgb), .08); }
.alert-custom .bi { color: var(--bs-primary); }
.alert-custom code { color: var(--ngbjs-code-color); }
`,i=`import { Component, Inject, type OnDestroy } from "ngjs-core";\r
import { NgbAlertConfig, NGB_ALERT_CONFIG } from "ngb-js/alert/compat";\r
\r
@Component({\r
    selector: "docs-alert-global",\r
    controllerAs: "example",\r
    templateUrl: "./alert-global.component.html",\r
    styleUrl: "./alert-global.component.css",\r
})\r
export class AlertGlobalComponent implements OnDestroy {\r
    private readonly initialConfig: Pick<NgbAlertConfig, "animation" | "dismissible" | "type">;\r
\r
    constructor(@Inject(NGB_ALERT_CONFIG) private readonly config: NgbAlertConfig) {\r
        this.initialConfig = {\r
            animation: config.animation,\r
            dismissible: config.dismissible,\r
            type: config.type,\r
        };\r
\r
        config.animation = false;\r
        config.dismissible = false;\r
        config.type = "success";\r
    }\r
\r
    public ngOnDestroy() {\r
        this.config.animation = this.initialConfig.animation;\r
        this.config.dismissible = this.initialConfig.dismissible;\r
        this.config.type = this.initialConfig.type;\r
    }\r
}\r
`,a=`import type { INgbAlert } from "ngb-js/alert";\r
import { Component, type OnDestroy, type OnInit, ViewChild } from "ngjs-core";\r
\r
@Component({\r
    selector: "docs-self-closing-alert",\r
    controllerAs: "example",\r
    templateUrl: "self-closing-alert.component.html",\r
    styleUrl: "./self-closing-alert.component.css",\r
})\r
export class SelfClosingAlertComponent implements OnInit, OnDestroy {\r
    private readonly initialSeconds = 5;\r
    private timer?: ReturnType<typeof setTimeout>;\r
\r
    @ViewChild("alert")\r
    private alert?: INgbAlert;\r
\r
    public remaining = this.initialSeconds;\r
    public visible = true;\r
\r
    public ngOnInit() {\r
        this.startTimer();\r
    }\r
\r
    public ngOnDestroy() {\r
        this.cancelTimer();\r
    }\r
\r
    public restart() {\r
        this.cancelTimer();\r
        this.remaining = this.initialSeconds;\r
        this.visible = true;\r
        this.startTimer();\r
    }\r
\r
    public onClosed() {\r
        this.visible = false;\r
        this.cancelTimer();\r
    }\r
\r
    private startTimer() {\r
        this.timer = setTimeout(() => {\r
            this.remaining--;\r
\r
            if (this.remaining <= 0) {\r
                if (this.alert) {\r
                    this.alert.close();\r
                } else {\r
                    this.visible = false;\r
                }\r
                return;\r
            }\r
\r
            this.startTimer();\r
        }, 1000);\r
    }\r
\r
    private cancelTimer() {\r
        if (this.timer) {\r
            clearTimeout(this.timer);\r
            this.timer = undefined;\r
        }\r
    }\r
}\r
`,o=`<ngb-alert type="'primary'" dismissible="false" animation="false">\r
    <strong>Heads up!</strong> This is a simple alert rendered with NgbJS.\r
</ngb-alert>\r
`,s=`<div class="d-flex justify-content-end mb-3">\r
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.reset()">\r
        <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>\r
        Reset alerts\r
    </button>\r
</div>\r
\r
<ngb-alert\r
    ng-repeat="alert in example.alerts track by alert.id"\r
    type="alert.type"\r
    dismissible="true"\r
    animation="alert.animation"\r
    closed="example.close(alert.id)">\r
    {{ alert.message }}\r
    <span class="small opacity-75">{{ alert.animation ? 'Animated' : 'No animation' }}</span>\r
</ngb-alert>\r
\r
<p class="text-body-secondary mb-0" ng-if="!example.alerts.length">\r
    All alerts have been closed.\r
</p>\r
`,c=`<div class="d-flex align-items-center justify-content-between gap-3 mb-3">\r
    <p class="small text-body-secondary mb-0">\r
        {{ example.visible ? 'The timer is running.' : 'The alert is closed.' }}\r
    </p>\r
    <button type="button" class="btn btn-outline-primary btn-sm" ng-click="example.restart()">\r
        <i class="bi bi-arrow-clockwise me-1" aria-hidden="true"></i>\r
        {{ example.visible ? 'Restart timer' : 'Show again' }}\r
    </button>\r
</div>\r
\r
<ngb-alert\r
    ng-if="example.visible"\r
    ng-ref="alert"\r
    ng-ref-read="ngbAlert"\r
    type="'info'"\r
    dismissible="true"\r
    animation="true"\r
    closed="example.onClosed()">\r
    This alert will close automatically in\r
    <strong>{{ example.remaining }} {{ example.remaining === 1 ? 'second' : 'seconds' }}</strong>.\r
</ngb-alert>\r
`,l=`<ngb-alert type="'custom'" dismissible="false" animation="false">\r
    <div class="d-flex align-items-start gap-3">\r
        <i class="bi bi-lightning-charge-fill fs-4 text-primary" aria-hidden="true"></i>\r
        <div>\r
            <h3 class="h6 mb-1">Custom alert</h3>\r
            <p class="mb-0">The <code>.alert-custom</code> class defines this theme without changing NgbJS.</p>\r
        </div>\r
    </div>\r
</ngb-alert>\r
`,u=`<div class="alert alert-light border d-flex align-items-start gap-3" role="note">\r
    <i class="bi bi-gear text-primary mt-1" aria-hidden="true"></i>\r
    <div>\r
        <p class="fw-semibold mb-1">Global defaults used by this example</p>\r
        <p class="small text-body-secondary mb-0">\r
            The default type is success, animations are disabled and alerts are not dismissible.\r
        </p>\r
    </div>\r
</div>\r
\r
<ngb-alert>\r
    This alert has no local inputs. Its appearance and behavior come from <code>NgbAlertConfig</code>.\r
</ngb-alert>\r
`,d=class{examples={simple:{html:o},closeable:{html:s,typescript:n},selfClosing:{html:c,typescript:a},custom:{html:l,css:r},global:{html:u,typescript:i}}};d=t([e({selector:`docs-alert-examples-page`,controllerAs:`$`,templateUrl:`/ngb-js-docs/templates/alert-examples-page.component-8753e391.html`,styleUrl:`./alert-examples-page.component.css`})],d);export{d as AlertExamplesPageComponent};