import {Component} from "ngjs-core";

@Component({
    selector: "docs-introduction-page",
    templateUrl: "./introduction-page.component.html",
    styleUrl: "./introduction-page.component.css"
})
export class IntroductionPageComponent {
    public activePackageManager = "npm"

    public readonly packageManagers = [
        { id: "npm", name: "npm", command: "npm install ngb-js" },
        { id: "pnpm", name: "pnpm", command: "pnpm add ngb-js" },
        { id: "yarn", name: "Yarn", command: "yarn add ngb-js" },
        { id: "bun", name: "Bun", command: "bun add ngb-js" },
    ]
}
