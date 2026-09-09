import type { IComponentController, IComponentOptions, IDirective, INgModelController } from "angular";
import type { NgbTimeStruct } from "ngb-js/timepicker";

export class TimepickerValidationComponent implements IComponentController {
    public time: NgbTimeStruct | null = null;
    static get $name() { return "docsTimepickerValidation" }
    static get $factory(): IComponentOptions {
        return { controller: TimepickerValidationComponent, controllerAs: "example", templateUrl: "./timepicker-validation.component.html", styleUrl: "./timepicker-validation.component.css" }
    }
}

export const timepickerLunchValidator = (): IDirective => ({
    restrict: "A",
    require: "ngModel",
    link: (_scope, _element, _attributes, controller) => {
        const ngModel = controller as INgModelController;
        ngModel.$validators.lunchtime = (modelValue: NgbTimeStruct | null) =>
            !modelValue || (modelValue.hour >= 12 && modelValue.hour <= 13);
    },
});
