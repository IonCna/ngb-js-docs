import { Component, Input } from "ngjs-core";
import { NgbModal, type NgbActiveModal } from "ngb-js/modal";

@Component({
    selector: "docs-modal-stacked-content",
    controllerAs: "$",
    templateUrl: "./modal-stacked-content.component.html",
    styleUrl: "./modal-stacked-content.component.css",
})
export class ModalStackedContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    @Input() level = 1;

    constructor(private readonly modal: NgbModal) {}

    public dismissAll() {
        this.modal.dismissAll("Dismiss all");
    }
}
