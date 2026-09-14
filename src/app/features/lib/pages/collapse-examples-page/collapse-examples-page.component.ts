import { Component } from "ngjs-core";
import horizontalCollapseTs from "@/features/lib/components/horizontal-collapse/horizontal-collapse.component.ts?raw"
import navbarCollapseTs from "@/features/lib/components/navbar-collapse/navbar-collapse.component.ts?raw"
import simpleCollapseTs from "@/features/lib/components/simple-collapse/simple-collapse.component.ts?raw"
import simpleCollapseHtml from "@/features/lib/components/simple-collapse/simple-collapse.component.html?raw"
import horizontalCollapseHtml from "@/features/lib/components/horizontal-collapse/horizontal-collapse.component.html?raw"
import navbarCollapseHtml from "@/features/lib/components/navbar-collapse/navbar-collapse.component.html?raw"

@Component({
    selector: "docs-collapse-examples-page",
    controllerAs: "$",
    templateUrl: "./collapse-examples-page.component.html",
    styleUrl: "./collapse-examples-page.component.css",
})
export class CollapseExamplesPageComponent {
    public readonly examples = {
        simple: {
            html: simpleCollapseHtml,
            typescript: simpleCollapseTs,
        },
        horizontal: {
            html: horizontalCollapseHtml,
            typescript: horizontalCollapseTs,
        },
        navbar: {
            html: navbarCollapseHtml,
            typescript: navbarCollapseTs,
        },
    }
}
