import { Component } from "ngjs-core";
import accordionContentTs from "@/features/accordion/components/accordion-content/accordion-content.component.ts?raw"
import accordionGlobalTs from "@/features/accordion/components/accordion-global/accordion-global.component.ts?raw"
import accordionTogglePanelsTs from "@/features/accordion/components/accordion-toggle-panels/accordion-toggle-panels.component.ts?raw"
import accordionSimpleHtml from "@/features/accordion/components/accordion-simple/accordion-simple.component.html?raw"
import onePanelAccordionHtml from "@/features/accordion/components/one-panel-accordion/one-panel-accordion.component.html?raw"
import accordionTogglePanelsHtml from "@/features/accordion/components/accordion-toggle-panels/accordion-toggle-panels.component.html?raw"
import accordionCustomHeaderHtml from "@/features/accordion/components/accordion-custom-header/accordion-custom-header.component.html?raw"
import accordionContentHtml from "@/features/accordion/components/accordion-content/accordion-content.component.html?raw"
import accordionGlobalHtml from "@/features/accordion/components/accordion-global/accordion-global.component.html?raw"

@Component({
    selector: "docs-accordion-examples-page",
    controllerAs: "$",
    templateUrl: "accordion-examples-page.component.html",
    styleUrl: "./accordion-examples-page.component.css",
})
export class AccordionExamplesPageComponent {
    public readonly examples = {
        simple: {
            html: accordionSimpleHtml,
        },
        onePanel: {
            html: onePanelAccordionHtml,
        },
        togglePanels: {
            html: accordionTogglePanelsHtml,
            typescript: accordionTogglePanelsTs,
        },
        customHeader: {
            html: accordionCustomHeaderHtml,
        },
        content: {
            html: accordionContentHtml,
            typescript: accordionContentTs,
        },
        global: {
            html: accordionGlobalHtml,
            typescript: accordionGlobalTs,
        },
    }
}
