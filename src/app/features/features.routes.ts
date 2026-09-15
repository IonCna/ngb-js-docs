import type {Routes} from "ngjs-core/router";

export const routes: Routes = [
    {
        path: "alert",
        loadChildren: () =>
            import("@/features/alert/alert.module").then(m => m.AlertModule)
    },
    {
        path: "accordion",
        loadChildren: () =>
            import("@/features/accordion/accordion.module").then(m => m.AccordionModule)
    }
]