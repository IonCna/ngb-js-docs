import { Component, ViewChild } from "ngjs-core";

interface AccordionController {
    expandAll(): void;
    collapseAll(): void;
    toggle(itemId: string): void;
}

@Component({
    selector: "docs-accordion-toggle-panels",
    controllerAs: "example",
    templateUrl: "accordion-toggle-panels.component.html",
    styleUrl: "./accordion-toggle-panels.component.css",
})
export class AccordionTogglePanelsComponent {
    @ViewChild("accordion", { static: true })
    private accordion!: AccordionController;

    public expandAll() {
        this.accordion.expandAll();
    }

    public collapseAll() {
        this.accordion.collapseAll();
    }

    public toggle(itemId: string) {
        this.accordion.toggle(itemId);
    }
}
