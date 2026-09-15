import { Component, Inject, type AfterViewInit, type OnDestroy } from "ngjs-core";
import { NgbNavConfig, NGB_NAV_CONFIG } from "ngb-js/nav";

@Component({
    selector: "docs-nav-global",
    controllerAs: "example",
    templateUrl: "./nav-global.component.html",
    styleUrl: "./nav-global.component.css",
})
export class NavGlobalComponent implements AfterViewInit, OnDestroy {
    public activeId = "global-account";

    private readonly initialConfig: Pick<
        NgbNavConfig,
        "animation" | "destroyOnHide" | "keyboard" | "orientation" | "roles"
    >;

    constructor(@Inject(NGB_NAV_CONFIG) private readonly config: NgbNavConfig) {
        this.initialConfig = {
            animation: config.animation,
            destroyOnHide: config.destroyOnHide,
            keyboard: config.keyboard,
            orientation: config.orientation,
            roles: config.roles,
        };

        config.animation = false;
        config.destroyOnHide = false;
        config.keyboard = "changeWithArrows";
        config.orientation = "vertical";
        config.roles = "tablist";
    }

    public ngAfterViewInit() {
        this.restoreConfig();
    }

    public ngOnDestroy() {
        this.restoreConfig();
    }

    private restoreConfig() {
        this.config.animation = this.initialConfig.animation;
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;
        this.config.keyboard = this.initialConfig.keyboard;
        this.config.orientation = this.initialConfig.orientation;
        this.config.roles = this.initialConfig.roles;
    }
}
