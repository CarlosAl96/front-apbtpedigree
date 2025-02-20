import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true,
})
export class TimeFormatPipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: Date | string | number): string {
    if (!value) return '';
    return this.datePipe.transform(value, 'hh:mm a') || '';
  }
}
