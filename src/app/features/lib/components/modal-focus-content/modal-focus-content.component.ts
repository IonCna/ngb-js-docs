import type { IComponentController, IComponentOptions } from "angular";
import type { NgbActiveModal } from "ngb-js/modal";

export class ModalFocusContentComponent implements IComponentController {
    public ngbActiveModal!: NgbActiveModal;
    public autofocus = false;

    static get $name() {
        return "docsModalFocusContent"
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                ngbActiveModal: "<",
                autofocus: "<?",
            },
            controller: ModalFocusContentComponent,
            controllerAs: "$",
            templateUrl: "./modal-focus-content.component.html", styleUrl: "./modal-focus-content.component.css",
        }
    }
}
