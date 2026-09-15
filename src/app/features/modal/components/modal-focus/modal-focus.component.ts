import { Component, Inject } from "ngjs-core";
import { ModalFocusContentComponent } from "@/features/modal/components/modal-focus-content/modal-focus-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-focus",
    controllerAs: "example",
    templateUrl: "./modal-focus.component.html",
    styleUrl: "./modal-focus.component.css",
})
export class ModalFocusComponent {
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public openDefaultFocus() {
        this.modal.open(ModalFocusContentComponent, {
            ariaLabelledBy: "modal-focus-title",
            bindings: { autofocus: false },
        });
    }

    public openCustomFocus() {
        this.modal.open(ModalFocusContentComponent, {
            ariaLabelledBy: "modal-focus-title",
            bindings: { autofocus: true },
        });
    }
}
