import { Component } from "ngjs-core";
import { NgbDateAdapter, NgbDateParserFormatter, type NgbDateStruct } from "ngb-js/datepicker";

class StringDateAdapter extends NgbDateAdapter<string> {
    fromModel(value: string | null): NgbDateStruct | null {
        if (!value) return null;
        const [year, month, day] = value.split("/").map(Number);
        return year && month && day ? { year, month, day } : null;
    }
    toModel(date: NgbDateStruct | null): string | null { return date ? `${date.year}/${date.month}/${date.day}` : null; }
}

class DotDateParserFormatter extends NgbDateParserFormatter {
    parse(value: string): NgbDateStruct | null {
        const [day, month, year] = value.split(".").map(Number);
        return day && month && year ? { year, month, day } : null;
    }
    format(date: NgbDateStruct | null): string { return date ? `${String(date.day).padStart(2, "0")}.${String(date.month).padStart(2, "0")}.${date.year}` : ""; }
}

@Component({
    selector: "docs-datepicker-custom-adapter",
    controllerAs: "example",
    templateUrl: "./datepicker-custom-adapter.component.html",
    styleUrl: "./datepicker-custom-adapter.component.css",
})
export class DatepickerCustomAdapterComponent {
    public readonly adapter = new StringDateAdapter();
    public readonly formatter = new DotDateParserFormatter();
    public date = "2026/8/24";
}
