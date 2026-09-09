import {Component} from "ngjs-core";

@Component({
    selector: "home-page",
    templateUrl: "./home-page.component.html",
    styleUrl: "./home-page.component.css"
})

export class HomePageComponent {
    readonly installCommand = "npm install ngb-js"
}
