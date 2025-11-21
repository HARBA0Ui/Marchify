import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'price'
})
export class PricePipe implements PipeTransform {

 transform(value: number, symbol: string = 'DT', decimal: number = 2): string {
    if (value == null) return '';
    // Format number with fixed decimals
    const formatted = value.toFixed(decimal);
    return `${formatted} ${symbol}`;
  }


}
