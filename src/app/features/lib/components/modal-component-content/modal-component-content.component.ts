import { Component, Inject } from "ngjs-core";
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-component-content",
    controllerAs: "example",
    templateUrl: "./modal-component-content.component.html",
    styleUrl: "./modal-component-content.component.css",
})
export class ModalComponentContentComponent {
    public lastResult = "No result yet";

    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public async open() {
        const modalRef = await this.modal.open(ModalDemoContentComponent, {
            bindings: {
                title: "Component as content",
                description: "NgbActiveModal is provided directly to the content component.",
            },
        });

        modalRef.closed.subscribe((result) => {
            this.lastResult = `Closed with: ${result}`;
        });

        modalRef.dismissed.subscribe((reason) => {
            this.lastResult = `Dismissed with: ${reason}`;
        });
    }
}
