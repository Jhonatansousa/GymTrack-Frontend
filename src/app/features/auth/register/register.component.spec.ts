import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create a form with name, email and password controls', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    expect(component.registerForm).toBeTruthy();
    expect(component.registerForm.contains('name')).toBeTruthy();
    expect(component.registerForm.contains('email')).toBeTruthy();
    expect(component.registerForm.contains('password')).toBeTruthy();
  });

  it('should render a submit button', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(submitButton).toBeTruthy();
  });

  it('should render name, email and password inputs with correct types', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const nameInput = compiled.querySelector("input[formControlName='name']");
    const emailInput = compiled.querySelector("input[formControlName='email']");
    const passwordInput = compiled.querySelector("input[formControlName='password']");

    expect(nameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(nameInput?.getAttribute('type')).toBe('text');
    expect(emailInput?.getAttribute('type')).toBe('email');
    expect(passwordInput?.getAttribute('type')).toBe('password');
  });

  it('should render a submit button labeled Register and a back button labeled Already a user?', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']");
    const backButton = compiled.querySelector("button[type='button']");

    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent).toContain('Register');
    expect(backButton).toBeTruthy();
    expect(backButton?.textContent).toContain('Already a user?');
  });

  it('should disable submit button when name is empty', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.registerForm.controls.name.setValue('');
    component.registerForm.controls.email.setValue('user@mail.com');
    component.registerForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable submit button when email is empty', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.registerForm.controls.name.setValue('User Name');
    component.registerForm.controls.email.setValue('');
    component.registerForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should disable submit button when password is empty', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.registerForm.controls.name.setValue('User Name');
    component.registerForm.controls.email.setValue('user@mail.com');
    component.registerForm.controls.password.setValue('');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.invalid).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should enable submit button when all fields are filled', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.registerForm.controls.name.setValue('User Name');
    component.registerForm.controls.email.setValue('user@mail.com');
    component.registerForm.controls.password.setValue('Valid@123');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitButton = compiled.querySelector("button[type='submit']") as HTMLButtonElement;

    expect(component.registerForm.valid).toBeTruthy();
    expect(submitButton.disabled).toBe(false);
  });

  it('should navigate to login page when clicking the back button', async () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const backButton = compiled.querySelector("button[type='button']");

    expect(backButton).toBeTruthy();

    backButton?.dispatchEvent(new MouseEvent('click'));

    expect(navigateSpy).toHaveBeenCalledWith(['/auth']);
  });
});
