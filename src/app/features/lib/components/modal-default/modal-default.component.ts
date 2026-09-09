import type { IComponentController, IComponentOptions } from "angular";
import { NgbModal, NGB_MODAL } from "ngb-js/modal/compat";
import { TemplateRef, ViewChild } from "ngjs-core";

export class ModalDefaultComponent implements IComponentController {
    @ViewChild("content", { read: TemplateRef, static: true })
    private content!: TemplateRef<unknown>;

    constructor(private readonly modal: NgbModal) {}

    public open() {
        this.modal.open(this.content);
    }

    static get $name() {
        return "docsModalDefault"
    }

    static get $inject() {
        return [NGB_MODAL]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: ModalDefaultComponent,
            controllerAs: "example",
            templateUrl: "./modal-default.component.html", styleUrl: "./modal-default.component.css",
        }
    }
}
