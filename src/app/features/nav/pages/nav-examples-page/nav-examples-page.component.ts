import { Component } from "ngjs-core";
import alternativeNavHtml from "@/features/nav/components/alternative-nav/alternative-nav.component.html?raw"
import alternativeNavTs from "@/features/nav/components/alternative-nav/alternative-nav.component.ts?raw"
import customNavCss from "@/features/nav/components/custom-nav/custom-nav.component.css?raw"
import customNavHtml from "@/features/nav/components/custom-nav/custom-nav.component.html?raw"
import customNavTs from "@/features/nav/components/custom-nav/custom-nav.component.ts?raw"
import dynamicNavHtml from "@/features/nav/components/dynamic-nav/dynamic-nav.component.html?raw"
import dynamicNavTs from "@/features/nav/components/dynamic-nav/dynamic-nav.component.ts?raw"
import keepContentNavHtml from "@/features/nav/components/keep-content-nav/keep-content-nav.component.html?raw"
import keepContentNavTs from "@/features/nav/components/keep-content-nav/keep-content-nav.component.ts?raw"
import navGlobalHtml from "@/features/nav/components/nav-global/nav-global.component.html?raw"
import navGlobalTs from "@/features/nav/components/nav-global/nav-global.component.ts?raw"
import selectingNavHtml from "@/features/nav/components/selecting-nav/selecting-nav.component.html?raw"
import selectingNavTs from "@/features/nav/components/selecting-nav/selecting-nav.component.ts?raw"
import simpleNavHtml from "@/features/nav/components/simple-nav/simple-nav.component.html?raw"
import simpleNavTs from "@/features/nav/components/simple-nav/simple-nav.component.ts?raw"
import verticalNavHtml from "@/features/nav/components/vertical-nav/vertical-nav.component.html?raw"
import verticalNavTs from "@/features/nav/components/vertical-nav/vertical-nav.component.ts?raw"

@Component({
    selector: "docs-nav-examples-page",
    controllerAs: "$",
    templateUrl: "./nav-examples-page.component.html",
    styleUrl: "./nav-examples-page.component.css",
})
export class NavExamplesPageComponent {
    public readonly examples = {
        simple: {
            html: simpleNavHtml,
            typescript: simpleNavTs,
        },
        alternative: {
            html: alternativeNavHtml,
            typescript: alternativeNavTs,
        },
        vertical: {
            html: verticalNavHtml,
            typescript: verticalNavTs,
        },
        selecting: {
            html: selectingNavHtml,
            typescript: selectingNavTs,
        },
        keepContent: {
            html: keepContentNavHtml,
            typescript: keepContentNavTs,
        },
        dynamic: {
            html: dynamicNavHtml,
            typescript: dynamicNavTs,
        },
        custom: {
            html: customNavHtml,
            typescript: customNavTs,
            css: customNavCss,
        },
        global: {
            html: navGlobalHtml,
            typescript: navGlobalTs,
        },
    }
}
