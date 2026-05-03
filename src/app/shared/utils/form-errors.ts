import { AbstractControl } from '@angular/forms';

export function shouldShowError(control: AbstractControl | null, errorKey: string): boolean {
  if (!control) return false;
  return control.touched && control.hasError(errorKey);
}
