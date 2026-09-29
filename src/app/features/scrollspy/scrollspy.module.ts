import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router";
import { NgbScrollSpyModule } from "ngb-js/scrollspy";
import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";
import { routes } from "@/features/scrollspy/scrollspy.routes";
import { BasicScrollspyComponent } from "@/features/scrollspy/components/basic-scrollspy/basic-scrollspy.component";
import { NavbarScrollspyComponent } from "@/features/scrollspy/components/navbar-scrollspy/navbar-scrollspy.component";
import { NestedScrollspyComponent } from "@/features/scrollspy/components/nested-scrollspy/nested-scrollspy.component";
import { ScrollspyMenuItemsComponent } from "@/features/scrollspy/components/scrollspy-menu-items/scrollspy-menu-items.component";
import { ScrollspyServiceDemoComponent } from "@/features/scrollspy/components/scrollspy-service-demo/scrollspy-service-demo.component";

@NgModule({ id: "docs.scrollspy", declarations: [BasicScrollspyComponent, NavbarScrollspyComponent, NestedScrollspyComponent, ScrollspyMenuItemsComponent, ScrollspyServiceDemoComponent], imports: [NgbScrollSpyModule, NgbNavModule, NgbCollapseModule, RouterModule.forChild(routes)] })
export class ScrollspyModule {}
