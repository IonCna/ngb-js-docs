import { Component } from "ngjs-core";
import autocloseHtml from "@/features/tooltip/components/tooltip-autoclose/tooltip-autoclose.component.html?raw"
import autocloseTs from "@/features/tooltip/components/tooltip-autoclose/tooltip-autoclose.component.ts?raw"
import bodyHtml from "@/features/tooltip/components/tooltip-body/tooltip-body.component.html?raw"
import bodyTs from "@/features/tooltip/components/tooltip-body/tooltip-body.component.ts?raw"
import contextHtml from "@/features/tooltip/components/tooltip-context/tooltip-context.component.html?raw"
import contextTs from "@/features/tooltip/components/tooltip-context/tooltip-context.component.ts?raw"
import customClassCss from "@/features/tooltip/components/tooltip-custom-class/tooltip-custom-class.component.css?raw"
import customClassHtml from "@/features/tooltip/components/tooltip-custom-class/tooltip-custom-class.component.html?raw"
import customClassTs from "@/features/tooltip/components/tooltip-custom-class/tooltip-custom-class.component.ts?raw"
import customTargetHtml from "@/features/tooltip/components/tooltip-custom-target/tooltip-custom-target.component.html?raw"
import customTargetTs from "@/features/tooltip/components/tooltip-custom-target/tooltip-custom-target.component.ts?raw"
import delaysHtml from "@/features/tooltip/components/tooltip-delays/tooltip-delays.component.html?raw"
import delaysTs from "@/features/tooltip/components/tooltip-delays/tooltip-delays.component.ts?raw"
import globalHtml from "@/features/tooltip/components/tooltip-global/tooltip-global.component.html?raw"
import globalTs from "@/features/tooltip/components/tooltip-global/tooltip-global.component.ts?raw"
import placementsHtml from "@/features/tooltip/components/tooltip-placements/tooltip-placements.component.html?raw"
import placementsTs from "@/features/tooltip/components/tooltip-placements/tooltip-placements.component.ts?raw"
import templateHtml from "@/features/tooltip/components/tooltip-template/tooltip-template.component.html?raw"
import templateTs from "@/features/tooltip/components/tooltip-template/tooltip-template.component.ts?raw"
import triggersHtml from "@/features/tooltip/components/tooltip-triggers/tooltip-triggers.component.html?raw"
import triggersTs from "@/features/tooltip/components/tooltip-triggers/tooltip-triggers.component.ts?raw"

@Component({
    selector: "docs-tooltip-examples-page",
    controllerAs: "$",
    templateUrl: "./tooltip-examples-page.component.html",
    styleUrl: "./tooltip-examples-page.component.css",
})
export class TooltipExamplesPageComponent {
    public readonly examples = {
        placements: { html: placementsHtml, typescript: placementsTs },
        template: { html: templateHtml, typescript: templateTs },
        triggers: { html: triggersHtml, typescript: triggersTs },
        autoclose: { html: autocloseHtml, typescript: autocloseTs },
        context: { html: contextHtml, typescript: contextTs },
        customTarget: { html: customTargetHtml, typescript: customTargetTs },
        delays: { html: delaysHtml, typescript: delaysTs },
        body: { html: bodyHtml, typescript: bodyTs },
        customClass: { html: customClassHtml, typescript: customClassTs, css: customClassCss },
        global: { html: globalHtml, typescript: globalTs },
    }
}
