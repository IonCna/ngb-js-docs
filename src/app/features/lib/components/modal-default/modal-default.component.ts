import { Component, Inject, TemplateRef, ViewChild } from "ngjs-core";
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

@Component({
    selector: "docs-modal-default",
    controllerAs: "example",
    templateUrl: "./modal-default.component.html",
    styleUrl: "./modal-default.component.css",
})
export class ModalDefaultComponent {
    @ViewChild("content", { read: TemplateRef, static: true })
    private content!: TemplateRef<unknown>;

    constructor(@Inject(NGB_MODAL) private readonly modal: NgbModal) {}

    public open() {
        this.modal.open(this.content);
    }
}
