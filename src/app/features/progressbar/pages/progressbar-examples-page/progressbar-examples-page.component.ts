import { Component } from "ngjs-core";
import contextualTs from "@/features/progressbar/components/contextual-text-progressbar/contextual-text-progressbar.component.ts?raw"
import contextualHtml from "@/features/progressbar/components/contextual-text-progressbar/contextual-text-progressbar.component.html?raw"
import globalTs from "@/features/progressbar/components/progressbar-global/progressbar-global.component.ts?raw"
import globalHtml from "@/features/progressbar/components/progressbar-global/progressbar-global.component.html?raw"
import heightTs from "@/features/progressbar/components/progress-height/progress-height.component.ts?raw"
import heightHtml from "@/features/progressbar/components/progress-height/progress-height.component.html?raw"
import labelsTs from "@/features/progressbar/components/custom-labels-progressbar/custom-labels-progressbar.component.ts?raw"
import labelsHtml from "@/features/progressbar/components/custom-labels-progressbar/custom-labels-progressbar.component.html?raw"
import simpleTs from "@/features/progressbar/components/simple-progressbar/simple-progressbar.component.ts?raw"
import simpleHtml from "@/features/progressbar/components/simple-progressbar/simple-progressbar.component.html?raw"
import stackedTs from "@/features/progressbar/components/progress-bars-stacked/progress-bars-stacked.component.ts?raw"
import stackedHtml from "@/features/progressbar/components/progress-bars-stacked/progress-bars-stacked.component.html?raw"
import stripedTs from "@/features/progressbar/components/striped-progress-bar/striped-progress-bar.component.ts?raw"
import stripedHtml from "@/features/progressbar/components/striped-progress-bar/striped-progress-bar.component.html?raw"

@Component({
    selector: "docs-progressbar-examples-page",
    controllerAs: "$",
    templateUrl: "./progressbar-examples-page.component.html",
    styleUrl: "./progressbar-examples-page.component.css",
})
export class ProgressbarExamplesPageComponent {
    public readonly examples = {
        simple: { html: simpleHtml, typescript: simpleTs },
        contextual: { html: contextualHtml, typescript: contextualTs },
        striped: { html: stripedHtml, typescript: stripedTs },
        labels: { html: labelsHtml, typescript: labelsTs },
        height: { html: heightHtml, typescript: heightTs },
        stacked: { html: stackedHtml, typescript: stackedTs },
        global: { html: globalHtml, typescript: globalTs },
    }
}
