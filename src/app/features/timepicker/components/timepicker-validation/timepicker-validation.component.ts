import { Component, Directive, forwardRef } from "ngjs-core";
import { type AbstractControl, NG_VALIDATORS, type ValidationErrors, type Validator } from "ngjs-core/forms";
import type { NgbTimeStruct } from "ngb-js/timepicker";

@Component({
    selector: "docs-timepicker-validation",
    controllerAs: "example",
    templateUrl: "./timepicker-validation.component.html",
    styleUrl: "./timepicker-validation.component.css",
})
export class TimepickerValidationComponent {
    public time: NgbTimeStruct | null = null;
}

@Directive({
    selector: "[docsTimepickerLunchValidator]",
    providers: [{ provide: NG_VALIDATORS, useExisting: forwardRef(() => TimepickerLunchValidatorDirective), multi: true }],
})
export class TimepickerLunchValidatorDirective implements Validator {
    public validate(control: AbstractControl): ValidationErrors | null {
        const time = control.value as NgbTimeStruct | null;
        return !time || (time.hour >= 12 && time.hour <= 13) ? null : { lunchtime: true };
    }
}
