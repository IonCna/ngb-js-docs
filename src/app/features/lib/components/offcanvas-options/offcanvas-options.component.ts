import type { IComponentController, IComponentOptions } from "angular";
import { OffcanvasDemoContentComponent } from "@/features/lib/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, type NgbOffcanvasOptions, NGB_OFFCANVAS } from "ngb-js/offcanvas";

export class OffcanvasOptionsComponent implements IComponentController {
    constructor(private readonly offcanvas: NgbOffcanvas) {}

    public openCustomPanel() {
        this.open({ panelClass: "panel" });
    }

    public openStaticBackdrop() {
        this.open({
            backdrop: "static",
            backdropClass: "backdrop",
            keyboard: false,
        });
    }

    public openStart() {
        this.open({ position: "start" });
    }

    public openEnd() {
        this.open({ position: "end" });
    }

    public openTop() {
        this.open({ position: "top" });
    }

    public openBottom() {
        this.open({ position: "bottom" });
    }

    public openScrollableBody() {
        this.open({ scroll: true, backdrop: false });
    }

    private open(options: NgbOffcanvasOptions) {
        this.offcanvas.open(OffcanvasDemoContentComponent.$name, options);
    }

    static get $name() {
        return "docsOffcanvasOptions"
    }

    static get $inject() {
        return [NGB_OFFCANVAS]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: OffcanvasOptionsComponent,
            controllerAs: "example",
            templateUrl: "./offcanvas-options.component.html",
            styleUrl: "./offcanvas-options.component.css",
        }
    }
}
