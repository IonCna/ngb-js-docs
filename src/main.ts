import { RootModule } from "@/app.module"
import {bootstrapApplication} from "ngjs-core";

bootstrapApplication(RootModule).catch(error => {
    console.log(error);
})