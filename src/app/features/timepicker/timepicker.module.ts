import { NgModule } from "ngjs-core";
import { RouterModule } from "ngjs-core/router";
import { NgbTimepickerModule } from "ngb-js/timepicker";
import { NgbScrollSpyModule } from "ngb-js/scrollspy";
import { NgbNavModule } from "ngb-js/nav";
import { NgbCollapseModule } from "ngb-js/collapse";
import { routes } from "@/features/timepicker/timepicker.routes";
import { BasicTimepickerComponent } from "@/features/timepicker/components/basic-timepicker/basic-timepicker.component";
import { MeridianTimepickerComponent } from "@/features/timepicker/components/meridian-timepicker/meridian-timepicker.component";
import { SecondsTimepickerComponent } from "@/features/timepicker/components/seconds-timepicker/seconds-timepicker.component";
import { SpinnersTimepickerComponent } from "@/features/timepicker/components/spinners-timepicker/spinners-timepicker.component";
import { TimepickerCustomAdapterComponent } from "@/features/timepicker/components/timepicker-custom-adapter/timepicker-custom-adapter.component";
import { TimepickerCustomStepsComponent } from "@/features/timepicker/components/timepicker-custom-steps/timepicker-custom-steps.component";
import { GreekTimepickerI18n, TimepickerI18nComponent } from "@/features/timepicker/components/timepicker-i18n/timepicker-i18n.component";
import { TimepickerValidationComponent, TimepickerLunchValidatorDirective } from "@/features/timepicker/components/timepicker-validation/timepicker-validation.component";

@NgModule({ id: "docs.timepicker", declarations: [BasicTimepickerComponent, MeridianTimepickerComponent, SecondsTimepickerComponent, SpinnersTimepickerComponent, TimepickerCustomAdapterComponent, TimepickerCustomStepsComponent, TimepickerI18nComponent, TimepickerValidationComponent, TimepickerLunchValidatorDirective], providers: [GreekTimepickerI18n], imports: [NgbTimepickerModule, NgbScrollSpyModule, NgbNavModule, NgbCollapseModule, RouterModule.forChild(routes)] })
export class TimepickerModule {}
