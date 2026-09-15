import { Component, Inject } from "ngjs-core";
import { ModalStackedContentComponent } from "@/features/modal/components/modal-stacked-content/modal-stacked-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-stacked",
    controllerAs: "example",
    templateUrl: "./modal-stacked.component.html",
    styleUrl: "./modal-stacked.component.css",
})
export class ModalStackedComponent {
    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public async openStack() {
        for (let level = 1; level <= 3; level++) {
            await this.modal.open(ModalStackedContentComponent, {
                bindings: {
                    level,
                },
            });
        }
    }
}
