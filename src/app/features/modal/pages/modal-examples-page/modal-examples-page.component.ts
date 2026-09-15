import { Component } from "ngjs-core";
import modalComponentContentTs from "@/features/modal/components/modal-component-content/modal-component-content.component.ts?raw"
import modalDefaultTs from "@/features/modal/components/modal-default/modal-default.component.ts?raw"
import modalDemoContentTs from "@/features/modal/components/modal-demo-content/modal-demo-content.component.ts?raw"
import modalFocusTs from "@/features/modal/components/modal-focus/modal-focus.component.ts?raw"
import modalFocusContentTs from "@/features/modal/components/modal-focus-content/modal-focus-content.component.ts?raw"
import modalGlobalTs from "@/features/modal/components/modal-global/modal-global.component.ts?raw"
import modalOptionsCss from "@/features/modal/components/modal-options/modal-options.component.css?raw"
import modalOptionsTs from "@/features/modal/components/modal-options/modal-options.component.ts?raw"
import modalStackedTs from "@/features/modal/components/modal-stacked/modal-stacked.component.ts?raw"
import modalStackedContentTs from "@/features/modal/components/modal-stacked-content/modal-stacked-content.component.ts?raw"
import modalUpdatableTs from "@/features/modal/components/modal-updatable/modal-updatable.component.ts?raw"
import modalUpdatableContentTs from "@/features/modal/components/modal-updatable-content/modal-updatable-content.component.ts?raw"
import modalDefaultHtml from "@/features/modal/components/modal-default/modal-default.component.html?raw"
import modalComponentContentHtml from "@/features/modal/components/modal-component-content/modal-component-content.component.html?raw"
import modalDemoContentHtml from "@/features/modal/components/modal-demo-content/modal-demo-content.component.html?raw"
import modalFocusHtml from "@/features/modal/components/modal-focus/modal-focus.component.html?raw"
import modalFocusContentHtml from "@/features/modal/components/modal-focus-content/modal-focus-content.component.html?raw"
import modalOptionsHtml from "@/features/modal/components/modal-options/modal-options.component.html?raw"
import modalUpdatableHtml from "@/features/modal/components/modal-updatable/modal-updatable.component.html?raw"
import modalUpdatableContentHtml from "@/features/modal/components/modal-updatable-content/modal-updatable-content.component.html?raw"
import modalStackedHtml from "@/features/modal/components/modal-stacked/modal-stacked.component.html?raw"
import modalStackedContentHtml from "@/features/modal/components/modal-stacked-content/modal-stacked-content.component.html?raw"
import modalGlobalHtml from "@/features/modal/components/modal-global/modal-global.component.html?raw"

@Component({
    selector: "docs-modal-examples-page",
    controllerAs: "$",
    templateUrl: "./modal-examples-page.component.html",
    styleUrl: "./modal-examples-page.component.css",
})
export class ModalExamplesPageComponent {
    public readonly examples = {
        defaults: {
            html: modalDefaultHtml,
            typescript: modalDefaultTs,
        },
        componentContent: {
            html: `<!-- modal-component-content.component.html -->\n${modalComponentContentHtml}\n\n<!-- modal-demo-content.component.html -->\n${modalDemoContentHtml}`,
            typescript: `${modalComponentContentTs}\n\n// modal-demo-content.component.ts\n${modalDemoContentTs}`,
        },
        focus: {
            html: `<!-- modal-focus.component.html -->\n${modalFocusHtml}\n\n<!-- modal-focus-content.component.html -->\n${modalFocusContentHtml}`,
            typescript: `${modalFocusTs}\n\n// modal-focus-content.component.ts\n${modalFocusContentTs}`,
        },
        options: {
            html: modalOptionsHtml,
            typescript: modalOptionsTs,
            css: modalOptionsCss,
        },
        updatable: {
            html: `<!-- modal-updatable.component.html -->\n${modalUpdatableHtml}\n\n<!-- modal-updatable-content.component.html -->\n${modalUpdatableContentHtml}`,
            typescript: `${modalUpdatableTs}\n\n// modal-updatable-content.component.ts\n${modalUpdatableContentTs}`,
            css: modalOptionsCss,
        },
        stacked: {
            html: `<!-- modal-stacked.component.html -->\n${modalStackedHtml}\n\n<!-- modal-stacked-content.component.html -->\n${modalStackedContentHtml}`,
            typescript: `${modalStackedTs}\n\n// modal-stacked-content.component.ts\n${modalStackedContentTs}`,
        },
        global: {
            html: modalGlobalHtml,
            typescript: modalGlobalTs,
        },
    }
}
