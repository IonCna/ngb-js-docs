import {Component} from "ngjs-core";

// Un `assets` (`src/assets`): relativo al `<base href>`, igual en `ngjs serve` y en la GitHub Page.
const brandIconUrl = "assets/brand/ngb-js-icon.png"

@Component({
    selector: "docs-home-hero",
    templateUrl: "./home-hero.component.html",
    styleUrl: "./home-hero.component.css"
})
export class HomeHeroComponent {
    public readonly brandIconUrl = brandIconUrl
}
