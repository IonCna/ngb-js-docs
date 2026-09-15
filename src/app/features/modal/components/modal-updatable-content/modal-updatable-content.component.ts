import { Component, Input } from "ngjs-core";
import type { NgbActiveModal, NgbModalUpdatableOptions } from "ngb-js/modal";

@Component({
    selector: "docs-modal-updatable-content",
    controllerAs: "$",
    templateUrl: "./modal-updatable-content.component.html",
    styleUrl: "./modal-updatable-content.component.css",
})
export class ModalUpdatableContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    public ariaReferences = true;
    public centered = false;
    public fullscreen = false;
    public customBackdrop = false;
    public size: NgbModalUpdatableOptions["size"] = "sm";
    public customWindow = false;
    public customDialog = false;

    public toggleAriaReferences() {
        this.ariaReferences = !this.ariaReferences;
        this.ngbActiveModal.update({
            ariaLabelledBy: this.ariaReferences ? "updatable-modal-title" : "",
            ariaDescribedBy: this.ariaReferences ? "updatable-modal-description" : "",
        });
    }

    public toggleCentered() {
        this.centered = !this.centered;
        this.ngbActiveModal.update({ centered: this.centered });
    }

    public toggleFullscreen() {
        this.fullscreen = !this.fullscreen;
        this.ngbActiveModal.update({ fullscreen: this.fullscreen });
    }

    public toggleBackdropClass() {
        this.customBackdrop = !this.customBackdrop;
        this.ngbActiveModal.update({ backdropClass: this.customBackdrop ? "updated-backdrop" : "" });
    }

    public cycleSize() {
        const sizes: Array<NgbModalUpdatableOptions["size"]> = ["sm", "lg", "xl"];
        this.size = sizes[(sizes.indexOf(this.size) + 1) % sizes.length];
        this.ngbActiveModal.update({ size: this.size });
    }

    public toggleWindowClass() {
        this.customWindow = !this.customWindow;
        this.ngbActiveModal.update({ windowClass: this.customWindow ? "updated-window" : "" });
    }

    public toggleDialogClass() {
        this.customDialog = !this.customDialog;
        this.ngbActiveModal.update({ modalDialogClass: this.customDialog ? "updated-dialog" : "" });
    }
}
