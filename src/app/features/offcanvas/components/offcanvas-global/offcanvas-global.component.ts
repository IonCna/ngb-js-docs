import { Component, Inject, type OnDestroy } from "ngjs-core";
import { OffcanvasDemoContentComponent } from "@/features/offcanvas/components/offcanvas-demo-content/offcanvas-demo-content.component"
import { NgbOffcanvas, NgbOffcanvasConfig, NGB_OFFCANVAS, NGB_OFFCANVAS_CONFIG } from "ngb-js/offcanvas";

@Component({
    selector: "docs-offcanvas-global",
    controllerAs: "example",
    templateUrl: "./offcanvas-global.component.html",
    styleUrl: "./offcanvas-global.component.css",
})
export class OffcanvasGlobalComponent implements OnDestroy {
    private readonly initialConfig: Pick<
        NgbOffcanvasConfig,
        "backdrop" | "keyboard" | "position" | "scroll"
    >;

    constructor(
        @Inject(NGB_OFFCANVAS) private readonly offcanvas: NgbOffcanvas,
        @Inject(NGB_OFFCANVAS_CONFIG) private readonly config: NgbOffcanvasConfig,
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
            await this.offcanvas.open(OffcanvasDemoContentComponent);
        } finally {
            this.restoreConfig();
        }
    }

    public ngOnDestroy() {
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
}
