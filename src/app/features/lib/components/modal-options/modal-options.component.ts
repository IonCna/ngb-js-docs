import type { IComponentController, IComponentOptions } from "angular";
import { ModalDemoContentComponent } from "@/features/lib/components/modal-demo-content/modal-demo-content.component"
import { NgbModal, type NgbModalOptions, NGB_MODAL } from "ngb-js/modal";

export class ModalOptionsComponent implements IComponentController {
    constructor(private readonly modal: NgbModal) {}

    public openCustomWindow() {
        this.open("Custom window class", { windowClass: "window" });
    }

    public openStaticBackdrop() {
        this.open("Static custom backdrop", {
            backdrop: "static",
            backdropClass: "backdrop",
            keyboard: false,
        });
    }

    public openSmall() {
        this.open("Small modal", { size: "sm" });
    }

    public openLarge() {
        this.open("Large modal", { size: "lg" });
    }

    public openExtraLarge() {
        this.open("Extra large modal", { size: "xl" });
    }

    public openFullscreen() {
        this.open("Fullscreen modal", { fullscreen: true });
    }

    public openCentered() {
        this.open("Vertically centered modal", { centered: true });
    }

    public openScrollable() {
        this.open("Scrollable modal", { scrollable: true, size: "lg" }, true);
    }

    public openCustomDialog() {
        this.open("Custom dialog class", { modalDialogClass: "dialog" });
    }

    private open(title: string, options: NgbModalOptions, longContent = false) {
        this.modal.open(ModalDemoContentComponent.$name, {
            ...options,
            bindings: {
                title,
                description: "These values are applied only to this modal instance.",
                longContent,
            },
        });
    }

    static get $name() {
        return "docsModalOptions"
    }

    static get $inject() {
        return [NGB_MODAL]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: ModalOptionsComponent,
            controllerAs: "example",
            templateUrl: "./modal-options.component.html",
            styleUrl: "./modal-options.component.css",
        }
    }
}
