import { Component } from "ngjs-core";
import adapterTs from "@/features/timepicker/components/timepicker-custom-adapter/timepicker-custom-adapter.component.ts?raw"
import adapterHtml from "@/features/timepicker/components/timepicker-custom-adapter/timepicker-custom-adapter.component.html?raw"
import basicTs from "@/features/timepicker/components/basic-timepicker/basic-timepicker.component.ts?raw"
import basicHtml from "@/features/timepicker/components/basic-timepicker/basic-timepicker.component.html?raw"
import i18nTs from "@/features/timepicker/components/timepicker-i18n/timepicker-i18n.component.ts?raw"
import i18nHtml from "@/features/timepicker/components/timepicker-i18n/timepicker-i18n.component.html?raw"
import meridianTs from "@/features/timepicker/components/meridian-timepicker/meridian-timepicker.component.ts?raw"
import meridianHtml from "@/features/timepicker/components/meridian-timepicker/meridian-timepicker.component.html?raw"
import secondsTs from "@/features/timepicker/components/seconds-timepicker/seconds-timepicker.component.ts?raw"
import secondsHtml from "@/features/timepicker/components/seconds-timepicker/seconds-timepicker.component.html?raw"
import spinnersTs from "@/features/timepicker/components/spinners-timepicker/spinners-timepicker.component.ts?raw"
import spinnersHtml from "@/features/timepicker/components/spinners-timepicker/spinners-timepicker.component.html?raw"
import stepsTs from "@/features/timepicker/components/timepicker-custom-steps/timepicker-custom-steps.component.ts?raw"
import stepsHtml from "@/features/timepicker/components/timepicker-custom-steps/timepicker-custom-steps.component.html?raw"
import validationTs from "@/features/timepicker/components/timepicker-validation/timepicker-validation.component.ts?raw"
import validationHtml from "@/features/timepicker/components/timepicker-validation/timepicker-validation.component.html?raw"

@Component({
    selector: "docs-timepicker-examples-page",
    controllerAs: "$",
    templateUrl: "./timepicker-examples-page.component.html",
    styleUrl: "./timepicker-examples-page.component.css",
})
export class TimepickerExamplesPageComponent {
    public readonly examples = {
        basic: { html: basicHtml, typescript: basicTs },
        meridian: { html: meridianHtml, typescript: meridianTs },
        seconds: { html: secondsHtml, typescript: secondsTs },
        spinners: { html: spinnersHtml, typescript: spinnersTs },
        steps: { html: stepsHtml, typescript: stepsTs },
        validation: { html: validationHtml, typescript: validationTs },
        adapter: { html: adapterHtml, typescript: adapterTs },
        i18n: { html: i18nHtml, typescript: i18nTs },
    }
}
