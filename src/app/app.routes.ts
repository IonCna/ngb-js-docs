import type { Routes } from "ngjs-core/router"
import {MenuAbstractPageComponent} from "@/core/layouts/pages/menu-abstract-page/menu-abstract-page.component";
import { HomePageComponent } from "@/features/home/pages/home-page/home-page.component"

export const routes: Routes = [
    {
        path: "",
        pathMatch: "full",
        component: HomePageComponent
    },
    {
      path: "",
      component: MenuAbstractPageComponent,
      children: [
          {
              path: "guide",
              loadChildren: () =>
                  import("@/features/guide/guide.module").then(m => m.GuideModule),
          },
          {
              path: "components",
              loadChildren: () =>
                  import("@/features/features.module").then(m => m.FeaturesModule),
          },
      ]
    }
]
