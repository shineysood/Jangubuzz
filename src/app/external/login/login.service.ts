import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private login_subject = new Subject<any>();

  constructor() { }

  loggedIn() {
    return this.login_subject.next({ login_flag: true });
  }

  loggedInObs() {
    return this.login_subject.asObservable();
  }
}
