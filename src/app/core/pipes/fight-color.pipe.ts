import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fightColor',
  standalone: true,
})
export class FightColorPipe implements PipeTransform {
  transform(obj: any): string {
    const color: string = obj.color;
    const fullname: string = obj.fullname;

    if (
      color.toLowerCase() === 'red' ||
      fullname.startsWith('GR') ||
      fullname.startsWith('CH')
    ) {
      return 'red';
    } else if (color.toLowerCase() === 'green') {
      return 'green';
    } else if (color.toLowerCase() === 'blue') {
      return 'blue';
    }
    return 'black';
  }
}
