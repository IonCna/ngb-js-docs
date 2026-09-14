import { Component } from "ngjs-core";

/**
 * Shell del layout con menú: header + menú lateral + `<ui-view>` + footer + outline.
 * Se declara en `LayoutModule` y se usa como `component` de las rutas de guide.
 * (lib, en modo UI-Router crudo, lo referencia por su nombre registrado:
 * `"docsMenuAbstractPage"`).
 */
@Component({
    selector: "docs-menu-abstract-page",
    templateUrl: "./menu-abstract-page.component.html",
    styleUrl: "./menu-abstract-page.component.css",
})
export class MenuAbstractPageComponent {}
