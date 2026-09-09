import type { IComponentController, IComponentOptions } from "angular";
import { OffcanvasDemoContentComponent } from "@/features/lib/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, NGB_OFFCANVAS } from "ngb-js/offcanvas";

export class OffcanvasComponentContentComponent implements IComponentController {
    public lastResult = "No result yet";

    constructor(private readonly offcanvas: NgbOffcanvas) {}

    public async open() {
        const offcanvasRef = await this.offcanvas.open(OffcanvasDemoContentComponent.$name);

        offcanvasRef.closed.subscribe((result) => {
            this.lastResult = `Closed with: ${result}`;
        });

        offcanvasRef.dismissed.subscribe((reason) => {
            this.lastResult = `Dismissed with: ${reason}`;
        });
    }

    static get $name() {
        return "docsOffcanvasComponentContent"
    }

    static get $inject() {
        return [NGB_OFFCANVAS]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: OffcanvasComponentContentComponent,
            controllerAs: "example",
            templateUrl: "./offcanvas-component-content.component.html", styleUrl: "./offcanvas-component-content.component.css",
        }
    }
}
