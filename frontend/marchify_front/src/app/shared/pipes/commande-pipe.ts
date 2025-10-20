import { Pipe, PipeTransform } from '@angular/core';
import { CmdStatus, Commande } from '../../core/models/commande';

@Pipe({
  name: 'filter',
  standalone: true,
  pure: false,
})
export class commandePipe implements PipeTransform {
  transform(items: Commande[], status: CmdStatus): Commande[] {
    if (!items || !status) {
      return items;
    }
    return items.filter((item) => item.status === status);
  }
}
