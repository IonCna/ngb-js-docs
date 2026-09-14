import { Component, Input } from "ngjs-core";
import type { NgbActiveModal } from "ngb-js/modal";

@Component({
    selector: "docs-modal-focus-content",
    controllerAs: "$",
    templateUrl: "./modal-focus-content.component.html",
    styleUrl: "./modal-focus-content.component.css",
})
export class ModalFocusContentComponent {
    @Input({ required: true }) ngbActiveModal!: NgbActiveModal;
    @Input() autofocus = false;
}
