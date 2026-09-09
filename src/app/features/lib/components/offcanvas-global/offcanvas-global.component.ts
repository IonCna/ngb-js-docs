import type { IComponentController, IComponentOptions } from "angular";
import { OffcanvasDemoContentComponent } from "@/features/lib/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, NgbOffcanvasConfig, NGB_OFFCANVAS, NGB_OFFCANVAS_CONFIG } from "ngb-js/offcanvas";

export class OffcanvasGlobalComponent implements IComponentController {
    private readonly initialConfig: Pick<
        NgbOffcanvasConfig,
        "backdrop" | "keyboard" | "position" | "scroll"
    >;

    constructor(
        private readonly offcanvas: NgbOffcanvas,
        private readonly config: NgbOffcanvasConfig,
    ) {
        this.initialConfig = {
            backdrop: config.backdrop,
            keyboard: config.keyboard,
            position: config.position,
            scroll: config.scroll,
        };
    }

    public async open() {
        this.applyConfig();

        try {
            await this.offcanvas.open(OffcanvasDemoContentComponent.$name);
        } finally {
            this.restoreConfig();
        }
    }

    public $onDestroy() {
        this.restoreConfig();
    }

    private applyConfig() {
        this.config.backdrop = "static";
        this.config.keyboard = false;
        this.config.position = "end";
        this.config.scroll = true;
    }

    private restoreConfig() {
        this.config.backdrop = this.initialConfig.backdrop;
        this.config.keyboard = this.initialConfig.keyboard;
        this.config.position = this.initialConfig.position;
        this.config.scroll = this.initialConfig.scroll;
    }

    static get $name() {
        return "docsOffcanvasGlobal"
    }

    static get $inject() {
        return [NGB_OFFCANVAS, NGB_OFFCANVAS_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: OffcanvasGlobalComponent,
            controllerAs: "example",
            templateUrl: "./offcanvas-global.component.html", styleUrl: "./offcanvas-global.component.css",
        }
    }
}
