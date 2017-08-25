import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the VideopipePipe pipe.
 *
 * See https://angular.io/docs/ts/latest/guide/pipes.html for more info on
 * Angular Pipes.
 */
@Pipe({
  name: 'videopipe',
})
export class VideopipePipe implements PipeTransform {
  /**
   * Takes a value and makes it lowercase.
   */
  /**
   *
   */
  constructor(private dom: DomSanitizer) {


  }
  transform(value: any) {
    return this.dom.bypassSecurityTrustResourceUrl(value);
  }
}
