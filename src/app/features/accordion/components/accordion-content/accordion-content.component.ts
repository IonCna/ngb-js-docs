import { Component } from "ngjs-core";

@Component({
    selector: "docs-accordion-content",
    controllerAs: "example",
    templateUrl: "accordion-content.component.html",
    styleUrl: "./accordion-content.component.css",
})
export class AccordionContentComponent {
    public draft = "This value remains after collapsing the panel.";
}
