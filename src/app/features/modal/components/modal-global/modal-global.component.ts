import { Component, Inject, type OnDestroy } from "ngjs-core";
import { ModalDemoContentComponent } from "@/features/modal/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, NgbModalConfig, NGB_MODAL, NGB_MODAL_CONFIG } from "ngb-js/modal";

@Component({
    selector: "docs-modal-global",
    controllerAs: "example",
    templateUrl: "./modal-global.component.html",
    styleUrl: "./modal-global.component.css",
})
export class ModalGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<NgbModalConfig, "backdrop" | "centered" | "keyboard" | "size">;

    constructor(
        @Inject(NGB_MODAL) private readonly modal: NgbModal,
        @Inject(NGB_MODAL_CONFIG) private readonly config: NgbModalConfig,
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
            await this.modal.open(ModalDemoContentComponent, {
                bindings: {
                    title: "Globally configured modal",
                    description: "This modal is centered, large and cannot be dismissed with Escape or a backdrop click.",
                },
            });
        } finally {
            this.restoreConfig();
        }
    }

    public ngOnDestroy() {
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
}
