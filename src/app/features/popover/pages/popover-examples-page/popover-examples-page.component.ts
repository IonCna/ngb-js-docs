import { Component } from "ngjs-core";
import autocloseTs from "@/features/popover/components/popover-autoclose/popover-autoclose.component.ts?raw"
import autocloseHtml from "@/features/popover/components/popover-autoclose/popover-autoclose.component.html?raw"
import bodyTs from "@/features/popover/components/popover-body/popover-body.component.ts?raw"
import bodyHtml from "@/features/popover/components/popover-body/popover-body.component.html?raw"
import contextTs from "@/features/popover/components/popover-context/popover-context.component.ts?raw"
import contextHtml from "@/features/popover/components/popover-context/popover-context.component.html?raw"
import customClassCss from "@/features/popover/components/popover-custom-class/popover-custom-class.component.css?raw"
import customClassTs from "@/features/popover/components/popover-custom-class/popover-custom-class.component.ts?raw"
import customClassHtml from "@/features/popover/components/popover-custom-class/popover-custom-class.component.html?raw"
import customTargetTs from "@/features/popover/components/popover-custom-target/popover-custom-target.component.ts?raw"
import customTargetHtml from "@/features/popover/components/popover-custom-target/popover-custom-target.component.html?raw"
import delaysTs from "@/features/popover/components/popover-delays/popover-delays.component.ts?raw"
import delaysHtml from "@/features/popover/components/popover-delays/popover-delays.component.html?raw"
import eventsTs from "@/features/popover/components/popover-events/popover-events.component.ts?raw"
import eventsHtml from "@/features/popover/components/popover-events/popover-events.component.html?raw"
import globalTs from "@/features/popover/components/popover-global/popover-global.component.ts?raw"
import globalHtml from "@/features/popover/components/popover-global/popover-global.component.html?raw"
import manualTs from "@/features/popover/components/popover-manual-control/popover-manual-control.component.ts?raw"
import manualHtml from "@/features/popover/components/popover-manual-control/popover-manual-control.component.html?raw"
import placementsTs from "@/features/popover/components/popover-placements/popover-placements.component.ts?raw"
import placementsHtml from "@/features/popover/components/popover-placements/popover-placements.component.html?raw"
import templateTs from "@/features/popover/components/popover-template/popover-template.component.ts?raw"
import templateHtml from "@/features/popover/components/popover-template/popover-template.component.html?raw"
import triggersTs from "@/features/popover/components/popover-triggers/popover-triggers.component.ts?raw"
import triggersHtml from "@/features/popover/components/popover-triggers/popover-triggers.component.html?raw"

@Component({
    selector: "docs-popover-examples-page",
    controllerAs: "$",
    templateUrl: "./popover-examples-page.component.html",
    styleUrl: "./popover-examples-page.component.css",
})
export class PopoverExamplesPageComponent {
    public readonly examples = {
        placements: { html: placementsHtml, typescript: placementsTs },
        template: { html: templateHtml, typescript: templateTs },
        triggers: { html: triggersHtml, typescript: triggersTs },
        manual: { html: manualHtml, typescript: manualTs },
        autoclose: { html: autocloseHtml, typescript: autocloseTs },
        context: { html: contextHtml, typescript: contextTs },
        customTarget: { html: customTargetHtml, typescript: customTargetTs },
        delays: { html: delaysHtml, typescript: delaysTs },
        events: { html: eventsHtml, typescript: eventsTs },
        body: { html: bodyHtml, typescript: bodyTs },
        customClass: { html: customClassHtml, typescript: customClassTs, css: customClassCss },
        global: { html: globalHtml, typescript: globalTs },
    }
}
