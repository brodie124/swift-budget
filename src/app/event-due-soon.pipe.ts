import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dueInDays',
  standalone: true
})
export class DueInDaysPipe implements PipeTransform {
  transform(daysUntil: number): string {
    const text = this.getText(daysUntil);
    console.log(`Days until = ${daysUntil}; Text = ${text}`);

    return text;
  }

  private getText(daysUntil: number): string {
    if (daysUntil >= 0 && daysUntil < 1)
      return 'Due today';

    if (daysUntil >= 1 && daysUntil < 2)
      return 'Due tomorrow';

    if (daysUntil <= -1 && daysUntil > -2)
      return 'Due yesterday';

    const plural = this.getPlural(daysUntil);
    if (daysUntil >= 2) {
      return `Due in ${plural}`
    }

    console.warn('Unhandled event due date.', {
      daysUntil
    });

    return 'Due date unknown'; // We shouldn't be reaching this point!
  }

  private getPlural(daysUntil: number): 'day' | 'days' {
    if (daysUntil === 1)
      return 'days';

    return 'day';
  }

}
