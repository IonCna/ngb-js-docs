import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router";
import { NgbToastModule } from "ngb-js/toast";
import { NgbScrollSpyModule } from "ngb-js/scrollspy";
import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";
import { routes } from "@/features/toast/toast.routes";
import { CloseableToastComponent } from "@/features/toast/components/closeable-toast/closeable-toast.component";
import { InlineToastComponent } from "@/features/toast/components/inline-toast/inline-toast.component";
import { PreventAutohideToastComponent } from "@/features/toast/components/prevent-autohide-toast/prevent-autohide-toast.component";
import { TemplateHeaderToastComponent } from "@/features/toast/components/template-header-toast/template-header-toast.component";
import { DocsToastService, ToastManagementComponent } from "@/features/toast/components/toast-management/toast-management.component";

@NgModule({ declarations: [CloseableToastComponent, InlineToastComponent, PreventAutohideToastComponent, TemplateHeaderToastComponent, ToastManagementComponent], providers: [DocsToastService], imports: [NgbToastModule, NgbScrollSpyModule, NgbNavModule, NgbCollapseModule, RouterModule.forChild(routes)] })
export class ToastModule {}
