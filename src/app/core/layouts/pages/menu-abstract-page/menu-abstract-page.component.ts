import { Component } from "ngjs-core";

/**
 * Shell del layout con menú: header + menú lateral + `<ui-view>` + footer + outline.
 *
 * `@Component` de `ngjs-core`: se declara en `LayoutModule` (`declarations`) y sirve
 * como `component` de rutas de `RouterModule` (que lee `ɵcmp`). El estado abstracto
 * `docs.dashboard` de UI-Router lo referencia por nombre vía `$name`.
 */
@Component({
    selector: "docs-menu-abstract-page",
    templateUrl: "./menu-abstract-page.component.html",
    styleUrl: "./menu-abstract-page.component.css",
    controllerAs: "$",
})
export class MenuAbstractPageComponent {
    /** Nombre con que queda registrada la directiva (camelCase del selector). */
    static readonly $name = "docsMenuAbstractPage";
}
