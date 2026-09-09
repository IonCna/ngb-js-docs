import type { IComponentController, IComponentOptions } from "angular";
import { NgbNavConfig, NGB_NAV_CONFIG } from "ngb-js/nav";

export class NavGlobalComponent implements IComponentController {
    public activeId = "global-account";

    private readonly initialConfig: Pick<
        NgbNavConfig,
        "animation" | "destroyOnHide" | "keyboard" | "orientation" | "roles"
    >;

    constructor(private readonly config: NgbNavConfig) {
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

    public $postLink() {
        this.restoreConfig();
    }

    public $onDestroy() {
        this.restoreConfig();
    }

    private restoreConfig() {
        this.config.animation = this.initialConfig.animation;
        this.config.destroyOnHide = this.initialConfig.destroyOnHide;
        this.config.keyboard = this.initialConfig.keyboard;
        this.config.orientation = this.initialConfig.orientation;
        this.config.roles = this.initialConfig.roles;
    }

    static get $name() {
        return "docsNavGlobal"
    }

    static get $inject() {
        return [NGB_NAV_CONFIG]
    }

    static get $factory(): IComponentOptions {
        return {
            controller: NavGlobalComponent,
            controllerAs: "example",
            templateUrl: "./nav-global.component.html", styleUrl: "./nav-global.component.css",
        }
    }
}
