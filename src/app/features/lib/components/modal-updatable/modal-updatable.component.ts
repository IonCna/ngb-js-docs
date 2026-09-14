import { Component, Inject } from "ngjs-core";
import { ModalUpdatableContentComponent } from "@/features/lib/components/modal-updatable-content/modal-updatable-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-updatable",
    controllerAs: "example",
    templateUrl: "./modal-updatable.component.html",
    styleUrl: "./modal-updatable.component.css",
})
export class ModalUpdatableComponent {
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public open() {
        this.modal.open(ModalUpdatableContentComponent, {
            ariaLabelledBy: "updatable-modal-title",
            ariaDescribedBy: "updatable-modal-description",
            size: "sm",
        });
    }
}
