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
      fullname.toLowerCase().startsWith('gr') ||
      fullname.toLowerCase().startsWith('ch')
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
