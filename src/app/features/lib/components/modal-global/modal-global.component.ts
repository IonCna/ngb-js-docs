import type { IComponentController, IComponentOptions } from "angular";
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, NgbModalConfig, NGB_MODAL, NGB_MODAL_CONFIG } from "ngb-js/modal";

export class ModalGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<NgbModalConfig, "backdrop" | "centered" | "keyboard" | "size">;

    constructor(
        private readonly modal: NgbModal,
        private readonly config: NgbModalConfig,
    ) {
        this.initialConfig = {
            backdrop: config.backdrop,
            centered: config.centered,
            keyboard: config.keyboard,
            size: config.size,
        };

    }

    public async open() {
        this.applyConfig();

        try {
            await this.modal.open(ModalDemoContentComponent.$name, {
                bindings: {
                    title: "Globally configured modal",
                    description: "This modal is centered, large and cannot be dismissed with Escape or a backdrop click.",
                },
            });
        } finally {
            this.restoreConfig();
        }
    }

    public $onDestroy() {
        this.restoreConfig();
    }

    private applyConfig() {
        this.config.backdrop = "static";
        this.config.centered = true;
        this.config.keyboard = false;
        this.config.size = "lg";
    }

    private restoreConfig() {
        this.config.backdrop = this.initialConfig.backdrop;
        this.config.centered = this.initialConfig.centered;
        this.config.keyboard = this.initialConfig.keyboard;
        this.config.size = this.initialConfig.size;
    }

    static get $name() {
        return "docsModalGlobal"
    }

    static get $inject() {
        return [NGB_MODAL, NGB_MODAL_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: ModalGlobalComponent,
            controllerAs: "example",
            templateUrl: "./modal-global.component.html", styleUrl: "./modal-global.component.css",
        }
    }
}
