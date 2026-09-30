import {Component} from "ngjs-core";

// En `public/`: relativo al `<base href>`, igual en `ngjs serve` y en la GitHub Page.
const brandIconUrl = "brand/ngb-js-icon.png"

@Component({
    selector: "docs-home-hero",
    templateUrl: "./home-hero.component.html",
    styleUrl: "./home-hero.component.css"
})
export class HomeHeroComponent {
    public readonly brandIconUrl = brandIconUrl
}
