import { Component, Inject, Input } from "ngjs-core";
import { NgbModal, type NgbActiveModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-stacked-content",
    controllerAs: "$",
    templateUrl: "./modal-stacked-content.component.html",
    styleUrl: "./modal-stacked-content.component.css",
})
export class ModalStackedContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    @Input() level = 1;

    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public dismissAll() {
        this.modal.dismissAll("Dismiss all");
    }
}
