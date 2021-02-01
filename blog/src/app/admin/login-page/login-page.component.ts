import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../shared/interfaces/user";
import {AuthService} from "../shared/services/auth.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  private _form: FormGroup;

  private _isSubmitted: boolean;

  constructor(public authService: AuthService, private _router: Router) { }

  public get form(): FormGroup {
    return this._form;
  }

  public set form(value: FormGroup) {
    this._form = value;
  }

  get isSubmitted(): boolean {
    return this._isSubmitted;
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(6)
      ]),
    })
  }

  public submit() {
    if (this.form.invalid) {
      return;
    }

    this._isSubmitted = true;

    const user: User = {
      email: this.form.value.email,
      password: this.form.value.password
    }

    this.authService.login(user).subscribe(() => {
      this.form.reset();
      this._router.navigate(['/admin', 'dashboard']);
      this._isSubmitted = false;
    }, error => {
      this._isSubmitted = false;
    });
  }
}
