import { FormControl, Validators } from '@angular/forms';

import { shouldShowError } from './form-errors';

describe('shouldShowError', () => {
  it('should return false when control is null', () => {
    expect(shouldShowError(null, 'required')).toBe(false);
  });

  it('should return false when control is untouched and has the error', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });

    expect(control.hasError('required')).toBe(true);
    expect(shouldShowError(control, 'required')).toBe(false);
  });

  it('should return false when control is touched and has no error', () => {
    const control = new FormControl('valid', { nonNullable: true, validators: [Validators.required] });
    control.markAsTouched();

    expect(shouldShowError(control, 'required')).toBe(false);
  });

  it('should return true when control is touched and has the specified error', () => {
    const control = new FormControl('', { nonNullable: true, validators: [Validators.required] });
    control.markAsTouched();

    expect(shouldShowError(control, 'required')).toBe(true);
  });

  it('should return false when control is touched and has a different error', () => {
    const control = new FormControl('not-an-email', {
      nonNullable: true,
      validators: [Validators.email],
    });
    control.markAsTouched();

    expect(control.hasError('email')).toBe(true);
    expect(shouldShowError(control, 'required')).toBe(false);
  });
});
