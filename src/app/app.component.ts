import { Component } from "ngjs-core";
import { ScrollService } from "@/core/services/scroll.service";
import { TitleService } from "@/core/services/title.service";

@Component({
    selector: "app-root",
    template: "<ui-view></ui-view>",
})
export class AppComponent {
    constructor(_scrollService: ScrollService, _titleService: TitleService) {}
}
