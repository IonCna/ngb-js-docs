import { Component } from "ngjs-core";
const alertCloseableTs = "import { Component } from \"ngjs-core\";\n\ninterface AlertExample {\n    id: number;\n    type: string;\n    message: string;\n    animation: boolean;\n}\n\nconst createAlerts = (): AlertExample[] => [\n    { id: 1, type: \"success\", message: \"Your changes were saved successfully.\", animation: true },\n    { id: 2, type: \"danger\", message: \"Something needs your attention.\", animation: true },\n    { id: 3, type: \"warning\", message: \"This alert closes without animation.\", animation: false },\n    { id: 4, type: \"info\", message: \"This one also closes immediately.\", animation: false },\n];\n\n@Component({\n    selector: \"docs-alert-closeable\",\n    controllerAs: \"example\",\n    templateUrl: \"./alert-closeable.component.html\",\n    styleUrl: \"./alert-closeable.component.css\",\n})\nexport class AlertCloseableComponent {\n    public alerts = createAlerts();\n\n    public close(id: number) {\n        this.alerts = this.alerts.filter((alert) => alert.id !== id);\n    }\n\n    public reset() {\n        this.alerts = createAlerts();\n    }\n}\n";
const alertCustomCss = ".alert-custom { --bs-alert-color: var(--bs-emphasis-color); --bs-alert-bg: color-mix(in srgb, var(--bs-primary-bg-subtle) 45%, var(--bs-body-bg)); --bs-alert-border-color: var(--bs-primary-border-subtle); --bs-alert-link-color: var(--bs-primary-text-emphasis); border-left: .3rem solid var(--bs-primary); box-shadow: 0 .75rem 2rem rgba(var(--bs-primary-rgb), .08); }\n.alert-custom .bi { color: var(--bs-primary); }\n.alert-custom code { color: var(--ngbjs-code-color); }\n";
const alertGlobalTs = "import { Component, type OnDestroy } from \"ngjs-core\";\nimport { NgbAlertConfig } from \"ngb-js/alert\";\n\n@Component({\n    selector: \"docs-alert-global\",\n    controllerAs: \"example\",\n    templateUrl: \"./alert-global.component.html\",\n    styleUrl: \"./alert-global.component.css\",\n})\nexport class AlertGlobalComponent implements OnDestroy {\n    private readonly initialConfig: Pick<NgbAlertConfig, \"animation\" | \"dismissible\" | \"type\">;\n\n    constructor(private readonly config: NgbAlertConfig) {\n        this.initialConfig = {\n            animation: config.animation,\n            dismissible: config.dismissible,\n            type: config.type,\n        };\n\n        config.animation = false;\n        config.dismissible = false;\n        config.type = \"success\";\n    }\n\n    public ngOnDestroy() {\n        this.config.animation = this.initialConfig.animation;\n        this.config.dismissible = this.initialConfig.dismissible;\n        this.config.type = this.initialConfig.type;\n    }\n}\n";
const selfClosingAlertTs = "import type { INgbAlert } from \"ngb-js/alert\";\nimport { Component, type OnDestroy, type OnInit, ViewChild } from \"ngjs-core\";\n\n@Component({\n    selector: \"docs-self-closing-alert\",\n    controllerAs: \"example\",\n    templateUrl: \"self-closing-alert.component.html\",\n    styleUrl: \"./self-closing-alert.component.css\",\n})\nexport class SelfClosingAlertComponent implements OnInit, OnDestroy {\n    private readonly initialSeconds = 5;\n    private timer?: ReturnType<typeof setTimeout>;\n\n    @ViewChild(\"alert\")\n    private alert?: INgbAlert;\n\n    public remaining = this.initialSeconds;\n    public visible = true;\n\n    public ngOnInit() {\n        this.startTimer();\n    }\n\n    public ngOnDestroy() {\n        this.cancelTimer();\n    }\n\n    public restart() {\n        this.cancelTimer();\n        this.remaining = this.initialSeconds;\n        this.visible = true;\n        this.startTimer();\n    }\n\n    public onClosed() {\n        this.visible = false;\n        this.cancelTimer();\n    }\n\n    private startTimer() {\n        this.timer = setTimeout(() => {\n            this.remaining--;\n\n            if (this.remaining <= 0) {\n                if (this.alert) {\n                    this.alert.close();\n                } else {\n                    this.visible = false;\n                }\n                return;\n            }\n\n            this.startTimer();\n        }, 1000);\n    }\n\n    private cancelTimer() {\n        if (this.timer) {\n            clearTimeout(this.timer);\n            this.timer = undefined;\n        }\n    }\n}\n";
const simpleAlertHtml = "<ngb-alert type=\"'primary'\" dismissible=\"false\" animation=\"false\">\n    <strong>Heads up!</strong> This is a simple alert rendered with NgbJS.\n</ngb-alert>\n";
const alertCloseableHtml = "<div class=\"d-flex justify-content-end mb-3\">\n    <button type=\"button\" class=\"btn btn-outline-primary btn-sm\" ng-click=\"example.reset()\">\n        <i class=\"bi bi-arrow-clockwise me-1\" aria-hidden=\"true\"></i>\n        Reset alerts\n    </button>\n</div>\n\n<ngb-alert\n    ng-repeat=\"alert in example.alerts track by alert.id\"\n    type=\"alert.type\"\n    dismissible=\"true\"\n    animation=\"alert.animation\"\n    closed=\"example.close(alert.id)\">\n    {{ alert.message }}\n    <span class=\"small opacity-75\">{{ alert.animation ? 'Animated' : 'No animation' }}</span>\n</ngb-alert>\n\n<p class=\"text-body-secondary mb-0\" ng-if=\"!example.alerts.length\">\n    All alerts have been closed.\n</p>\n";
const selfClosingAlertHtml = "<div class=\"d-flex align-items-center justify-content-between gap-3 mb-3\">\n    <p class=\"small text-body-secondary mb-0\">\n        {{ example.visible ? 'The timer is running.' : 'The alert is closed.' }}\n    </p>\n    <button type=\"button\" class=\"btn btn-outline-primary btn-sm\" ng-click=\"example.restart()\">\n        <i class=\"bi bi-arrow-clockwise me-1\" aria-hidden=\"true\"></i>\n        {{ example.visible ? 'Restart timer' : 'Show again' }}\n    </button>\n</div>\n\n<ngb-alert\n    ng-if=\"example.visible\"\n    ng-ref=\"alert\"\n    ng-ref-read=\"ngbAlert\"\n    type=\"'info'\"\n    dismissible=\"true\"\n    animation=\"true\"\n    closed=\"example.onClosed()\">\n    This alert will close automatically in\n    <strong>{{ example.remaining }} {{ example.remaining === 1 ? 'second' : 'seconds' }}</strong>.\n</ngb-alert>\n";
const alertCustomHtml = "<ngb-alert type=\"'custom'\" dismissible=\"false\" animation=\"false\">\n    <div class=\"d-flex align-items-start gap-3\">\n        <i class=\"bi bi-lightning-charge-fill fs-4 text-primary\" aria-hidden=\"true\"></i>\n        <div>\n            <h3 class=\"h6 mb-1\">Custom alert</h3>\n            <p class=\"mb-0\">The <code>.alert-custom</code> class defines this theme without changing NgbJS.</p>\n        </div>\n    </div>\n</ngb-alert>\n";
const alertGlobalHtml = "<div class=\"alert alert-light border d-flex align-items-start gap-3\" role=\"note\">\n    <i class=\"bi bi-gear text-primary mt-1\" aria-hidden=\"true\"></i>\n    <div>\n        <p class=\"fw-semibold mb-1\">Global defaults used by this example</p>\n        <p class=\"small text-body-secondary mb-0\">\n            The default type is success, animations are disabled and alerts are not dismissible.\n        </p>\n    </div>\n</div>\n\n<ngb-alert>\n    This alert has no local inputs. Its appearance and behavior come from <code>NgbAlertConfig</code>.\n</ngb-alert>\n";

@Component({
    selector: "docs-alert-examples-page",
    controllerAs: "$",
    templateUrl: "alert-examples-page.component.html",
    styleUrl: "./alert-examples-page.component.css",
})
export class AlertExamplesPageComponent {
    public readonly examples = {
        simple: {
            html: simpleAlertHtml,
        },
        closeable: {
            html: alertCloseableHtml,
            typescript: alertCloseableTs,
        },
        selfClosing: {
            html: selfClosingAlertHtml,
            typescript: selfClosingAlertTs,
        },
        custom: {
            html: alertCustomHtml,
            css: alertCustomCss,
        },
        global: {
            html: alertGlobalHtml,
            typescript: alertGlobalTs,
        },
    }
}
