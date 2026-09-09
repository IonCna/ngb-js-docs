import type {IComponentController} from "angular";
import brandIconUrl from "@/assets/brand/ngb-js-icon.png"
import {Component} from "ngjs-core";

@Component({
    selector: "docs-home-hero",
    templateUrl: "./home-hero.component.html",
    styleUrl: "./home-hero.component.css"
})
export class HomeHeroComponent implements IComponentController {
    public readonly brandIconUrl = brandIconUrl
}
