import { Component } from "ngjs-core";
import alternativeNavHtml from "@/features/lib/components/alternative-nav/alternative-nav.component.html?raw"
import alternativeNavTs from "@/features/lib/components/alternative-nav/alternative-nav.component.ts?raw"
import customNavCss from "@/features/lib/components/custom-nav/custom-nav.component.css?raw"
import customNavHtml from "@/features/lib/components/custom-nav/custom-nav.component.html?raw"
import customNavTs from "@/features/lib/components/custom-nav/custom-nav.component.ts?raw"
import dynamicNavHtml from "@/features/lib/components/dynamic-nav/dynamic-nav.component.html?raw"
import dynamicNavTs from "@/features/lib/components/dynamic-nav/dynamic-nav.component.ts?raw"
import keepContentNavHtml from "@/features/lib/components/keep-content-nav/keep-content-nav.component.html?raw"
import keepContentNavTs from "@/features/lib/components/keep-content-nav/keep-content-nav.component.ts?raw"
import navGlobalHtml from "@/features/lib/components/nav-global/nav-global.component.html?raw"
import navGlobalTs from "@/features/lib/components/nav-global/nav-global.component.ts?raw"
import selectingNavHtml from "@/features/lib/components/selecting-nav/selecting-nav.component.html?raw"
import selectingNavTs from "@/features/lib/components/selecting-nav/selecting-nav.component.ts?raw"
import simpleNavHtml from "@/features/lib/components/simple-nav/simple-nav.component.html?raw"
import simpleNavTs from "@/features/lib/components/simple-nav/simple-nav.component.ts?raw"
import verticalNavHtml from "@/features/lib/components/vertical-nav/vertical-nav.component.html?raw"
import verticalNavTs from "@/features/lib/components/vertical-nav/vertical-nav.component.ts?raw"

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
