import { Pipe, PipeTransform } from "@angular/core";
import * as moment from "moment";

@Pipe({
  name: "sort"
})
export class orderByPipe implements PipeTransform {
  transform(array: any, field: any): any[] {
    if (!Array.isArray(array)) {
      return;
    }
    array.sort((a: any, b: any) => {
      if (moment(a).isAfter(b)) {
        return 1;
      } else if (!moment(a).isAfter(b)) {
        return -1;
      }
    });
    return array;
  }
}
