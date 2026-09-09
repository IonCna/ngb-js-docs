import { GuideModule } from "@/features/guide/guide.module"
import { HomeModule } from "@/features/home/home.module"
import { LibModule } from "@/features/lib/lib.module"
import {NgModule} from "ngjs-core";

@NgModule({
    id: "docs.features",
    imports: [GuideModule, HomeModule, LibModule]
})
export class FeaturesModule {}