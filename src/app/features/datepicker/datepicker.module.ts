import {NgModule} from "ngjs-core";
import { RouterModule } from "ngjs-core/router"
import {routes} from "@/features/datepicker/datepicker.routes";

import { NgbNavModule } from "ngb-js/nav"
import { NgbDatepickerModule } from "ngb-js/datepicker"
import { NgbCollapseModule } from "ngb-js/collapse"

import {BasicDatepickerComponent} from "@/features/datepicker/components/basic-datepicker/basic-datepicker.component.ts";
import {DatepickerCustomAdapterComponent} from "@/features/datepicker/components/datepicker-custom-adapter/datepicker-custom-adapter.component.ts";
import {DatepickerCustomDayComponent} from "@/features/datepicker/components/datepicker-custom-day/datepicker-custom-day.component.ts";
import {DatepickerCustomMonthComponent } from "@/features/datepicker/components/datepicker-custom-month/datepicker-custom-month.component.ts";
import {DatepickerFooterComponent} from "@/features/datepicker/components/datepicker-footer/datepicker-footer.component.ts";
import {DatepickerGlobalComponent} from "@/features/datepicker/components/datepicker-global/datepicker-global.component.ts";
import {DatepickerI18nComponent} from "@/features/datepicker/components/datepicker-i18n/datepicker-i18n.component.ts";
import { DatepickerKeyboardComponent } from "@/features/datepicker/components/datepicker-keyboard/datepicker-keyboard.component.ts";
import { DatepickerPositionTargetComponent } from "@/features/datepicker/components/datepicker-position-target/datepicker-position-target.component.ts";
import {DisabledDatepickerComponent} from "@/features/datepicker/components/disabled-datepicker/disabled-datepicker.component.ts";
import {MultipleMonthsDatepickerComponent} from "@/features/datepicker/components/multiple-months-datepicker/multiple-months-datepicker.component.ts";
import {PopupDatepickerComponent} from "@/features/datepicker/components/popup-datepicker/popup-datepicker.component.ts";
import {RangeDatepickerComponent} from "@/features/datepicker/components/range-datepicker/range-datepicker.component.ts";
import {RangePopupDatepickerComponent} from "@/features/datepicker/components/range-popup-datepicker/range-popup-datepicker.component.ts";

@NgModule({
    id: "docs.datepicker",
    declarations: [
        BasicDatepickerComponent,
        DatepickerCustomAdapterComponent,
        DatepickerCustomDayComponent,
        DatepickerCustomMonthComponent,
        DatepickerFooterComponent,
        DatepickerGlobalComponent,
        DatepickerI18nComponent,
        DatepickerKeyboardComponent,
        DatepickerPositionTargetComponent,
        DisabledDatepickerComponent,
        MultipleMonthsDatepickerComponent,
        PopupDatepickerComponent,
        RangeDatepickerComponent,
        RangePopupDatepickerComponent,
    ],
    imports: [
        NgbNavModule,
        NgbCollapseModule,
        NgbDatepickerModule,
        RouterModule.forChild(routes)
    ]
})
export class DatepickerModule {}
