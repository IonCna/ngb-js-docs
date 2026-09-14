import { Component } from "ngjs-core";
import { ScrollService } from "@/core/services/scroll.service";
import { TitleService } from "@/core/services/title.service";

@Component({
    selector: "app-root",
    template: "<ui-view></ui-view>",
})
export class AppComponent {
    // Inyectados solo para instanciarlos al arrancar: cada servicio se engancha
    // a `Router` en su propio constructor (reemplaza los viejos `.run()`).
    constructor(_scrollService: ScrollService, _titleService: TitleService) {}
}
