import { Component } from "ngjs-core";
import adapterTs from "@/features/lib/components/datepicker-custom-adapter/datepicker-custom-adapter.component.ts?raw"
import adapterHtml from "@/features/lib/components/datepicker-custom-adapter/datepicker-custom-adapter.component.html?raw"
import basicTs from "@/features/lib/components/basic-datepicker/basic-datepicker.component.ts?raw"
import basicHtml from "@/features/lib/components/basic-datepicker/basic-datepicker.component.html?raw"
import customDayCss from "@/features/lib/components/datepicker-custom-day/datepicker-custom-day.component.css?raw"
import customDayTs from "@/features/lib/components/datepicker-custom-day/datepicker-custom-day.component.ts?raw"
import customDayHtml from "@/features/lib/components/datepicker-custom-day/datepicker-custom-day.component.html?raw"
import customMonthCss from "@/features/lib/components/datepicker-custom-month/datepicker-custom-month.component.css?raw"
import customMonthTs from "@/features/lib/components/datepicker-custom-month/datepicker-custom-month.component.ts?raw"
import customMonthHtml from "@/features/lib/components/datepicker-custom-month/datepicker-custom-month.component.html?raw"
import disabledTs from "@/features/lib/components/disabled-datepicker/disabled-datepicker.component.ts?raw"
import disabledHtml from "@/features/lib/components/disabled-datepicker/disabled-datepicker.component.html?raw"
import footerTs from "@/features/lib/components/datepicker-footer/datepicker-footer.component.ts?raw"
import footerHtml from "@/features/lib/components/datepicker-footer/datepicker-footer.component.html?raw"
import globalTs from "@/features/lib/components/datepicker-global/datepicker-global.component.ts?raw"
import globalHtml from "@/features/lib/components/datepicker-global/datepicker-global.component.html?raw"
import i18nTs from "@/features/lib/components/datepicker-i18n/datepicker-i18n.component.ts?raw"
import i18nHtml from "@/features/lib/components/datepicker-i18n/datepicker-i18n.component.html?raw"
import keyboardTs from "@/features/lib/components/datepicker-keyboard/datepicker-keyboard.component.ts?raw"
import keyboardHtml from "@/features/lib/components/datepicker-keyboard/datepicker-keyboard.component.html?raw"
import multipleTs from "@/features/lib/components/multiple-months-datepicker/multiple-months-datepicker.component.ts?raw"
import multipleHtml from "@/features/lib/components/multiple-months-datepicker/multiple-months-datepicker.component.html?raw"
import popupTs from "@/features/lib/components/popup-datepicker/popup-datepicker.component.ts?raw"
import popupHtml from "@/features/lib/components/popup-datepicker/popup-datepicker.component.html?raw"
import positionTs from "@/features/lib/components/datepicker-position-target/datepicker-position-target.component.ts?raw"
import positionHtml from "@/features/lib/components/datepicker-position-target/datepicker-position-target.component.html?raw"
import rangeCss from "@/features/lib/components/range-datepicker/range-datepicker.component.css?raw"
import rangeTs from "@/features/lib/components/range-datepicker/range-datepicker.component.ts?raw"
import rangeHtml from "@/features/lib/components/range-datepicker/range-datepicker.component.html?raw"
import rangePopupCss from "@/features/lib/components/range-popup-datepicker/range-popup-datepicker.component.css?raw"
import rangePopupTs from "@/features/lib/components/range-popup-datepicker/range-popup-datepicker.component.ts?raw"
import rangePopupHtml from "@/features/lib/components/range-popup-datepicker/range-popup-datepicker.component.html?raw"

@Component({
    selector: "docs-datepicker-examples-page",
    controllerAs: "$",
    templateUrl: "./datepicker-examples-page.component.html",
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
