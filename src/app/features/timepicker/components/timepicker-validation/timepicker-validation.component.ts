import { Component, Directive } from "ngjs-core";
import type { INgModelController } from "angular";
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
    require: "ngModel",
    link: (_scope, _element, _attributes, controller) => {
        const ngModel = controller as INgModelController;
        ngModel.$validators.lunchtime = (modelValue: NgbTimeStruct | null) =>
            !modelValue || (modelValue.hour >= 12 && modelValue.hour <= 13);
    },
})
export class TimepickerLunchValidatorDirective {}
