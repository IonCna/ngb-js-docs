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
    },
    {
        path: "carousel",
        loadChildren: () =>
            import("@/features/carousel/carousel.module").then(m => m.CarouselModule)
    },
    {
        path: "collapse",
        loadChildren: () =>
            import("@/features/collapse/collapse.module").then(m => m.CollapseModule)
    },
    {
        path: "datepicker",
        loadChildren: () =>
            import("@/features/datepicker/datepicker.module").then(m => m.DatepickerModule)
    },
    {
        path: "dropdown",
        loadChildren: () =>
            import("@/features/dropdown/dropdown.module").then(m => m.DropdownModule)
    },
    {
        path: "modal",
        loadChildren: () =>
            import("@/features/modal/modal.module").then(m => m.ModalModule)
    },
    {
        path: "nav",
        loadChildren: () =>
            import("@/features/nav/nav.module").then(m => m.NavModule)
    },
    {
        path: "offcanvas",
        loadChildren: () =>
            import("@/features/offcanvas/offcanvas.module").then(m => m.OffcanvasModule)
    },
    {
        path: "pagination",
        loadChildren: () =>
            import("@/features/pagination/pagination.module").then(m => m.PaginationModule)
    },
    {
        path: "popover",
        loadChildren: () =>
            import("@/features/popover/popover.module").then(m => m.PopoverModule)
    },
    {
        path: "progressbar",
        loadChildren: () =>
            import("@/features/progressbar/progressbar.module").then(m => m.ProgressbarModule)
    }
]
