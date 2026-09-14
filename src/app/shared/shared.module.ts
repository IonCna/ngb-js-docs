import { NgModule } from "ngjs-core";
import { CopyButtonComponent } from "@/shared/components/copy-button/copy-button.component"
import { ExampleSectionComponent } from "@/shared/components/example-section/example-section.component"
import { PageOutlineComponent } from "@/shared/components/page-outline/page-outline.component"
import { TitleHeadingComponent } from "@/shared/components/title-heading/title-heading.component"

@NgModule({
    id: "docs.shared",
    declarations: [
        CopyButtonComponent,
        ExampleSectionComponent,
        PageOutlineComponent,
        TitleHeadingComponent,
    ],
})
export class SharedModule {}
