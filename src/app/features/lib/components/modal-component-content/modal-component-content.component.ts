import type { IComponentController, IComponentOptions } from "angular";
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, NGB_MODAL } from "ngb-js/modal/compat";

export class ModalComponentContentComponent implements IComponentController {
    public lastResult = "No result yet";

    constructor(private readonly modal: NgbModal) {}

    public async open() {
        const modalRef = await this.modal.open(ModalDemoContentComponent.$name, {
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

    static get $name() {
        return "docsModalComponentContent"
    }

    static get $inject() {
        return [NGB_MODAL]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: ModalComponentContentComponent,
            controllerAs: "example",
            templateUrl: "./modal-component-content.component.html", styleUrl: "./modal-component-content.component.css",
        }
    }
}
