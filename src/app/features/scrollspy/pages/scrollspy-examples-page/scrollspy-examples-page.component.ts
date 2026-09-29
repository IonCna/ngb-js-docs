import { Component } from "ngjs-core";
import serviceTs from "@/features/scrollspy/components/scrollspy-service-demo/scrollspy-service-demo.component.ts?raw"
import serviceHtml from "@/features/scrollspy/components/scrollspy-service-demo/scrollspy-service-demo.component.html?raw"
import basicHtml from "@/features/scrollspy/components/basic-scrollspy/basic-scrollspy.component.html?raw"
import navbarHtml from "@/features/scrollspy/components/navbar-scrollspy/navbar-scrollspy.component.html?raw"
import nestedHtml from "@/features/scrollspy/components/nested-scrollspy/nested-scrollspy.component.html?raw"
import menuItemsHtml from "@/features/scrollspy/components/scrollspy-menu-items/scrollspy-menu-items.component.html?raw"

@Component({
    selector: "docs-scrollspy-examples-page",
    controllerAs: "$",
    templateUrl: "./scrollspy-examples-page.component.html",
    styleUrl: "./scrollspy-examples-page.component.css",
})
export class ScrollspyExamplesPageComponent {
    public readonly examples = {
        basic: { html: basicHtml },
        menuItems: { html: menuItemsHtml },
        nested: { html: nestedHtml },
        navbar: { html: navbarHtml },
        service: { html: serviceHtml, typescript: serviceTs },
    }
}
