import { Component } from "ngjs-core";
import basicTs from "@/features/lib/components/basic-rating/basic-rating.component.ts?raw"
import basicHtml from "@/features/lib/components/basic-rating/basic-rating.component.html?raw"
import customTemplateCss from "@/features/lib/components/rating-custom-template/rating-custom-template.component.css?raw"
import customTemplateTs from "@/features/lib/components/rating-custom-template/rating-custom-template.component.ts?raw"
import customTemplateHtml from "@/features/lib/components/rating-custom-template/rating-custom-template.component.html?raw"
import decimalCss from "@/features/lib/components/rating-decimal/rating-decimal.component.css?raw"
import decimalTs from "@/features/lib/components/rating-decimal/rating-decimal.component.ts?raw"
import decimalHtml from "@/features/lib/components/rating-decimal/rating-decimal.component.html?raw"
import eventsTs from "@/features/lib/components/rating-events/rating-events.component.ts?raw"
import eventsHtml from "@/features/lib/components/rating-events/rating-events.component.html?raw"
import formTs from "@/features/lib/components/rating-form/rating-form.component.ts?raw"
import formHtml from "@/features/lib/components/rating-form/rating-form.component.html?raw"
import globalTs from "@/features/lib/components/rating-global/rating-global.component.ts?raw"
import globalHtml from "@/features/lib/components/rating-global/rating-global.component.html?raw"

@Component({
    selector: "docs-rating-examples-page",
    controllerAs: "$",
    templateUrl: "./rating-examples-page.component.html",
    styleUrl: "./rating-examples-page.component.css",
})
export class RatingExamplesPageComponent {
    public readonly examples = {
        basic: { html: basicHtml, typescript: basicTs },
        events: { html: eventsHtml, typescript: eventsTs },
        customTemplate: { html: customTemplateHtml, typescript: customTemplateTs, css: customTemplateCss },
        decimal: { html: decimalHtml, typescript: decimalTs, css: decimalCss },
        form: { html: formHtml, typescript: formTs },
        global: { html: globalHtml, typescript: globalTs },
    }
}
