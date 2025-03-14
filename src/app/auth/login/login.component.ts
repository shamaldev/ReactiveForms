import { Component, DestroyRef, inject } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, of } from 'rxjs';
const savedForm = window.localStorage.getItem('saved-login-form');
let initialEmailValue =''
if (savedForm) {
  const loadedForm = JSON.parse(savedForm)
  initialEmailValue = loadedForm.email
}

function mustContainQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }
  return { doesNotContainQuestionMarl: true };
}

function emailIsUnique(control: AbstractControl) {
  if (control.value != 'test@example.com') {
    return of(null);
  }
  return of({ notUnique: true });
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private destroyRef = inject(DestroyRef)
  form = new FormGroup({
    email: new FormControl(initialEmailValue, {
      validators: [Validators.email, Validators.required],
      asyncValidators: [emailIsUnique],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        mustContainQuestionMark,
      ],
    }),
  });
  ngOnInit() {
// const savedForm = window.localStorage.getItem('saved-login-form');
// if (savedForm) {
//   const loadedForm = JSON.parse(savedForm)
//   this.form.patchValue({email:loadedForm.email})
// }

    const subscription = this.form.valueChanges
      .pipe(debounceTime(500))
      .subscribe({
        next: (value) => {
          window.localStorage.setItem(
            'saved-login-form',
            JSON.stringify({ email: value.email })
          );
        },
      });
      this.destroyRef.onDestroy(()=>subscription.unsubscribe())
  }
  get emailIsInvaild() {
    return (
      this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
    );
  }

  get passwordIsInvaild() {
    return (
      this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
    );
  }

  onSubmit() {
    console.log(this.form);
    const enteredEmail = this.form.value.email;
    const enteredPassword = this.form.value.password;
    console.log(enteredEmail, enteredPassword);
  }
}
