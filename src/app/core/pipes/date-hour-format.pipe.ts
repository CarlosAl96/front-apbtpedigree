import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateHourFormat',
  standalone: true,
})
export class DateHourFormatPipe implements PipeTransform {
  transform(fechaISO: string): string {
    if (!fechaISO) {
      return '-';
    }

    const fecha = new Date(fechaISO);

    const formatter = new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return formatter.format(fecha);
  }
}
