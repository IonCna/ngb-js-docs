import type { IComponentController, IComponentOptions } from "angular";
import { ModalStackedContentComponent } from "@/features/lib/components/modal-stacked-content/modal-stacked-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal";

export class ModalStackedComponent implements IComponentController {
    constructor(private readonly modal: NgbModal) {}

    public async openStack() {
        for (let level = 1; level <= 3; level++) {
            await this.modal.open(ModalStackedContentComponent.$name, {
                bindings: {
                    level,
                },
            });
        }
    }

    static get $name() {
        return "docsModalStacked"
    }

    static get $inject() {
        return [NGB_MODAL]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: ModalStackedComponent,
            controllerAs: "example",
            templateUrl: "./modal-stacked.component.html", styleUrl: "./modal-stacked.component.css",
        }
    }
}
