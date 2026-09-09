import type { IComponentController, IComponentOptions } from "angular";
import { NgbModal, type NgbActiveModal, NGB_MODAL } from "ngb-js/modal";

export class ModalStackedContentComponent implements IComponentController {
    public ngbActiveModal!: NgbActiveModal;
    public level = 1;

    constructor(private readonly modal: NgbModal) {}

    public dismissAll() {
        this.modal.dismissAll("Dismiss all");
    }

    static get $name() {
        return "docsModalStackedContent"
    }

    static get $inject() {
        return [NGB_MODAL]
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                ngbActiveModal: "<",
                level: "<?",
            },
            controller: ModalStackedContentComponent,
            controllerAs: "$",
            templateUrl: "./modal-stacked-content.component.html", styleUrl: "./modal-stacked-content.component.css",
        }
    }
}
