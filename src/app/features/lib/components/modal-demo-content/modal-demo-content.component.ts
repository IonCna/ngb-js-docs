import type { IComponentController, IComponentOptions } from "angular";
import type { NgbActiveModal } from "ngb-js/modal";

export class ModalDemoContentComponent implements IComponentController {
    public ngbActiveModal!: NgbActiveModal;
    public title = "Component modal";
    public description = "This modal receives a component as its content.";
    public longContent = false;
    public readonly items = Array.from({ length: 24 }, (_, index) => `Scrollable content row ${index + 1}`);

    static get $name() {
        return "docsModalDemoContent"
    }

    static get $factory(): IComponentOptions {
        return {
            bindings: {
                ngbActiveModal: "<",
                title: "<?",
                description: "<?",
                longContent: "<?",
            },
            controller: ModalDemoContentComponent,
            controllerAs: "$",
            templateUrl: "./modal-demo-content.component.html", styleUrl: "./modal-demo-content.component.css",
        }
    }
}
