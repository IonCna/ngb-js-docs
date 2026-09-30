import { Component, Input } from "ngjs-core";
import type { NgbActiveModal } from "ngb-js/modal";

@Component({
    selector: "docs-modal-demo-content",
    controllerAs: "$",
    templateUrl: "./modal-demo-content.component.html",
    styleUrl: "./modal-demo-content.component.css",
})
export class ModalDemoContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    @Input() title = "Component modal";
    @Input() description = "This modal receives a component as its content.";
    @Input() longContent = false;
    public readonly items = Array.from({ length: 24 }, (_, index) => `Scrollable content row ${index + 1}`);
}
