import { Component } from "ngjs-core";

@Component({
    selector: "docs-navbar-collapse",
    controllerAs: "example",
    templateUrl: "navbar-collapse.component.html",
    styleUrl: "./navbar-collapse.component.css",
})
export class NavbarCollapseComponent {
    public menuCollapsed = true;

    public toggleMenu() {
        this.menuCollapsed = !this.menuCollapsed;
    }

    public closeMenu() {
        this.menuCollapsed = true;
    }
}
