import {
  Directive,
  ElementRef,
  HostListener,
  Optional,
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appUppercaseInput], textarea[appUppercaseInput]',
  standalone: true,
})
export class UppercaseInputDirective {
  constructor(
    private readonly elementRef: ElementRef<
      HTMLInputElement | HTMLTextAreaElement
    >,
    @Optional() @Self() private readonly ngControl: NgControl
  ) {}

  @HostListener('input')
  public onInput(): void {
    const element = this.elementRef.nativeElement;
    const value = element.value;
    const uppercasedValue = value.toUpperCase();

    if (value === uppercasedValue) {
      return;
    }

    const selectionStart = element.selectionStart;
    const selectionEnd = element.selectionEnd;

    element.value = uppercasedValue;
    this.ngControl?.control?.setValue(uppercasedValue);

    if (selectionStart !== null && selectionEnd !== null) {
      element.setSelectionRange(selectionStart, selectionEnd);
    }
  }
}
