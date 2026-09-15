import { Component } from "ngjs-core";
import adapterTs from "@/features/datepicker/components/datepicker-custom-adapter/datepicker-custom-adapter.component.ts?raw"
import adapterHtml from "@/features/datepicker/components/datepicker-custom-adapter/datepicker-custom-adapter.component.html?raw"
import basicTs from "@/features/datepicker/components/basic-datepicker/basic-datepicker.component.ts?raw"
import basicHtml from "@/features/datepicker/components/basic-datepicker/basic-datepicker.component.html?raw"
import customDayCss from "@/features/datepicker/components/datepicker-custom-day/datepicker-custom-day.component.css?raw"
import customDayTs from "@/features/datepicker/components/datepicker-custom-day/datepicker-custom-day.component.ts?raw"
import customDayHtml from "@/features/datepicker/components/datepicker-custom-day/datepicker-custom-day.component.html?raw"
import customMonthCss from "@/features/datepicker/components/datepicker-custom-month/datepicker-custom-month.component.css?raw"
import customMonthTs from "@/features/datepicker/components/datepicker-custom-month/datepicker-custom-month.component.ts?raw"
import customMonthHtml from "@/features/datepicker/components/datepicker-custom-month/datepicker-custom-month.component.html?raw"
import disabledTs from "@/features/datepicker/components/disabled-datepicker/disabled-datepicker.component.ts?raw"
import disabledHtml from "@/features/datepicker/components/disabled-datepicker/disabled-datepicker.component.html?raw"
import footerTs from "@/features/datepicker/components/datepicker-footer/datepicker-footer.component.ts?raw"
import footerHtml from "@/features/datepicker/components/datepicker-footer/datepicker-footer.component.html?raw"
import globalTs from "@/features/datepicker/components/datepicker-global/datepicker-global.component.ts?raw"
import globalHtml from "@/features/datepicker/components/datepicker-global/datepicker-global.component.html?raw"
import i18nTs from "@/features/datepicker/components/datepicker-i18n/datepicker-i18n.component.ts?raw"
import i18nHtml from "@/features/datepicker/components/datepicker-i18n/datepicker-i18n.component.html?raw"
import keyboardTs from "@/features/datepicker/components/datepicker-keyboard/datepicker-keyboard.component.ts?raw"
import keyboardHtml from "@/features/datepicker/components/datepicker-keyboard/datepicker-keyboard.component.html?raw"
import multipleTs from "@/features/datepicker/components/multiple-months-datepicker/multiple-months-datepicker.component.ts?raw"
import multipleHtml from "@/features/datepicker/components/multiple-months-datepicker/multiple-months-datepicker.component.html?raw"
import popupTs from "@/features/datepicker/components/popup-datepicker/popup-datepicker.component.ts?raw"
import popupHtml from "@/features/datepicker/components/popup-datepicker/popup-datepicker.component.html?raw"
import positionTs from "@/features/datepicker/components/datepicker-position-target/datepicker-position-target.component.ts?raw"
import positionHtml from "@/features/datepicker/components/datepicker-position-target/datepicker-position-target.component.html?raw"
import rangeCss from "@/features/datepicker/components/range-datepicker/range-datepicker.component.css?raw"
import rangeTs from "@/features/datepicker/components/range-datepicker/range-datepicker.component.ts?raw"
import rangeHtml from "@/features/datepicker/components/range-datepicker/range-datepicker.component.html?raw"
import rangePopupCss from "@/features/datepicker/components/range-popup-datepicker/range-popup-datepicker.component.css?raw"
import rangePopupTs from "@/features/datepicker/components/range-popup-datepicker/range-popup-datepicker.component.ts?raw"
import rangePopupHtml from "@/features/datepicker/components/range-popup-datepicker/range-popup-datepicker.component.html?raw"

@Component({
    selector: "docs-datepicker-examples-page",
    controllerAs: "$",
    templateUrl: "datepicker-examples-page.component.html",
    styleUrl: "./datepicker-examples-page.component.css",
})
export class DatepickerExamplesPageComponent {
    public readonly examples = {
        basic: { html: basicHtml, typescript: basicTs }, popup: { html: popupHtml, typescript: popupTs },
        multiple: { html: multipleHtml, typescript: multipleTs }, range: { html: rangeHtml, typescript: rangeTs, css: rangeCss },
        rangePopup: { html: rangePopupHtml, typescript: rangePopupTs, css: rangePopupCss }, disabled: { html: disabledHtml, typescript: disabledTs },
        adapter: { html: adapterHtml, typescript: adapterTs }, i18n: { html: i18nHtml, typescript: i18nTs },
        customDay: { html: customDayHtml, typescript: customDayTs, css: customDayCss }, customMonth: { html: customMonthHtml, typescript: customMonthTs, css: customMonthCss },
        footer: { html: footerHtml, typescript: footerTs }, position: { html: positionHtml, typescript: positionTs },
        keyboard: { html: keyboardHtml, typescript: keyboardTs }, global: { html: globalHtml, typescript: globalTs },
    };
}
