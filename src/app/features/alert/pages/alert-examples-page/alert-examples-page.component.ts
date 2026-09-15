import { Component } from "ngjs-core";
import alertCloseableTs from "@/features/alert/components/alert-closeable/alert-closeable.component.ts?raw"
import alertCustomCss from "@/features/alert/components/alert-custom/alert-custom.component.css?raw"
import alertGlobalTs from "@/features/alert/components/alert-global/alert-global.component.ts?raw"
import selfClosingAlertTs from "@/features/alert/components/self-closing-alert/self-closing-alert.component.ts?raw"
import simpleAlertHtml from "@/features/alert/components/simple-alert/simple-alert.component.html?raw"
import alertCloseableHtml from "@/features/alert/components/alert-closeable/alert-closeable.component.html?raw"
import selfClosingAlertHtml from "@/features/alert/components/self-closing-alert/self-closing-alert.component.html?raw"
import alertCustomHtml from "@/features/alert/components/alert-custom/alert-custom.component.html?raw"
import alertGlobalHtml from "@/features/alert/components/alert-global/alert-global.component.html?raw"

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
