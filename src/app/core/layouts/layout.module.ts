import { NgModule } from "ngjs-core";
import { FooterComponent } from "@/core/layouts/components/footer/footer.component"
import { HeaderComponent } from "@/core/layouts/components/header/header.component"
import { MenuComponent } from "@/core/layouts/components/menu/menu.component"
import { SearchModalComponent } from "@/core/layouts/components/search-modal/search-modal.component"
import { MenuAbstractPageComponent } from "@/core/layouts/pages/menu-abstract-page/menu-abstract-page.component"

@NgModule({
    id: "docs.layout",
    declarations: [FooterComponent],
    imports: []
})
export class LayoutModule {}
