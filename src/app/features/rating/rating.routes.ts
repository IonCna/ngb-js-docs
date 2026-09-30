import type { Routes } from "ngjs-core/router";

export const routes: Routes = [{
    path: "",
    data: {
        title: "Rating",
        tabs: [
            { name: "Examples", to: "/components/rating/examples" },
            { name: "Api", to: "/components/rating/api" },
        ],
        externalLinks: { ngBootstrap: "components/rating/overview" },
    },
    children: [
        { path: "", pathMatch: "full", redirectTo: "examples" },
        { path: "examples", data: { sections: [
            { id: "basic-rating", name: "Basic demo" },
            { id: "rating-events", name: "Events and readonly" },
            { id: "rating-custom-template", name: "Custom star template" },
            { id: "rating-decimal", name: "Decimal rating" },
            { id: "rating-form", name: "Form integration" },
            { id: "rating-global", name: "Global configuration" },
        ] }, loadComponent: () => import("@/features/rating/pages/rating-examples-page/rating-examples-page.component").then(m => m.RatingExamplesPageComponent) },
        { path: "api", data: { sections: [
            { id: "ngb-rating", name: "NgbRating" },
            { id: "ngb-rating-config", name: "NgbRatingConfig" },
        ] }, loadComponent: () => import("@/features/rating/pages/rating-api-page/rating-api-page.component").then(m => m.RatingApiPageComponent) },
    ],
}];
