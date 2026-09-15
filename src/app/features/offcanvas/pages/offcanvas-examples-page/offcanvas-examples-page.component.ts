import { Component } from "ngjs-core";
import offcanvasComponentContentHtml from "@/features/offcanvas/components/offcanvas-component-content/offcanvas-component-content.component.html?raw"
import offcanvasComponentContentTs from "@/features/offcanvas/components/offcanvas-component-content/offcanvas-component-content.component.ts?raw"
import offcanvasDefaultHtml from "@/features/offcanvas/components/offcanvas-default/offcanvas-default.component.html?raw"
import offcanvasDefaultTs from "@/features/offcanvas/components/offcanvas-default/offcanvas-default.component.ts?raw"
import offcanvasDemoContentHtml from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component.html?raw"
import offcanvasDemoContentTs from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component.ts?raw"
import offcanvasFocusHtml from "@/features/offcanvas/components/offcanvas-focus/offcanvas-focus.component.html?raw"
import offcanvasFocusTs from "@/features/offcanvas/components/offcanvas-focus/offcanvas-focus.component.ts?raw"
import offcanvasFocusContentHtml from "@/features/offcanvas/components/offcanvas-focus-content/offcanvas-focus-content.component.html?raw"
import offcanvasFocusContentTs from "@/features/offcanvas/components/offcanvas-focus-content/offcanvas-focus-content.component.ts?raw"
import offcanvasGlobalHtml from "@/features/offcanvas/components/offcanvas-global/offcanvas-global.component.html?raw"
import offcanvasGlobalTs from "@/features/offcanvas/components/offcanvas-global/offcanvas-global.component.ts?raw"
import offcanvasOptionsCss from "@/features/offcanvas/components/offcanvas-options/offcanvas-options.component.css?raw"
import offcanvasOptionsHtml from "@/features/offcanvas/components/offcanvas-options/offcanvas-options.component.html?raw"
import offcanvasOptionsTs from "@/features/offcanvas/components/offcanvas-options/offcanvas-options.component.ts?raw"

@Component({
    selector: "docs-offcanvas-examples-page",
    controllerAs: "$",
    templateUrl: "./offcanvas-examples-page.component.html",
    styleUrl: "./offcanvas-examples-page.component.css",
})
export class OffcanvasExamplesPageComponent {
    public readonly examples = {
        defaults: {
            html: offcanvasDefaultHtml,
            typescript: offcanvasDefaultTs,
        },
        componentContent: {
            html: `<!-- offcanvas-component-content.component.html -->\n${offcanvasComponentContentHtml}\n\n<!-- offcanvas-demo-content.component.html -->\n${offcanvasDemoContentHtml}`,
            typescript: `${offcanvasComponentContentTs}\n\n// offcanvas-demo-content.component.ts\n${offcanvasDemoContentTs}`,
        },
        focus: {
            html: `<!-- offcanvas-focus.component.html -->\n${offcanvasFocusHtml}\n\n<!-- offcanvas-focus-content.component.html -->\n${offcanvasFocusContentHtml}`,
            typescript: `${offcanvasFocusTs}\n\n// offcanvas-focus-content.component.ts\n${offcanvasFocusContentTs}`,
        },
        options: {
            html: offcanvasOptionsHtml,
            typescript: offcanvasOptionsTs,
            css: offcanvasOptionsCss,
        },
        global: {
            html: offcanvasGlobalHtml,
            typescript: offcanvasGlobalTs,
        },
    }
}
