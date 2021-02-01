import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {User} from '../../../shared/interfaces/user';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';
import {FirebaseAuthResponse} from '../../../shared/interfaces/firebase-auth-response';

@Injectable()
export class AuthService {

  private _error$: Subject<string> = new Subject<string>();

  constructor(private _http: HttpClient) {
  }

  get error$(): Subject<string> {
    return this._error$;
  }

  public getToken(): string | null {
    const date = localStorage.getItem('firebase-expires');

    if (date === null) {
      return null;
    }

    const expiresDate = new Date(date);

    if (new Date() > expiresDate) {
      this.logout();
      return null;
    }
    return localStorage.getItem('firebase-token');
  }

  public login(user: User): Observable<any> {
    user.returnSecureToken = true;
    return this._http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap(this.setToken),
        catchError(this.handleError.bind(this))
      );
  }

  public logout(): void {
    this.setToken(null);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error;

    switch (message) {
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Email не сущетсвует');
        break;
      case 'INVALID_EMAIL':
        this.error$.next('Неверный email');
        break;
      case 'INVALID_PASSWORD':
        this.error$.next('Неверный пароль');
        break;
    }

    return throwError(error);
  }

  private setToken(response: FirebaseAuthResponse | null): void {
    if (response) {
      const expiresDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
      localStorage.setItem('firebase-token', response.idToken);
      localStorage.setItem('firebase-expires', expiresDate.toString());
    } else {
      localStorage.clear();
    }
  }
}
