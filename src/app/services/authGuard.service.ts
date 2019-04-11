import { Injectable } from "@angular/core";
import { Router, CanActivate, CanDeactivate } from "@angular/router";

import { Observable } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class AuthGuardService
  implements CanActivate, CanDeactivate<CanComponentDeactivate> {
  constructor(public router: Router, private afAuth: AngularFireAuth) {}

  canActivate(): boolean {
    if (!this.isAuthenticated()) {
      // show alert message if he will navigate to internal routes
      if (window.confirm("You have to login first or create your account")) {
        this.router.navigateByUrl("/"); // will navigate to the home page where user can log in
      }

      return false;
    } else {
      return true;
    }
  }

  canDeactivate(component: CanComponentDeactivate) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }

  isAuthenticated(): boolean {
    if (this.afAuth.auth.currentUser) {
      if (this.afAuth.auth.currentUser.isAnonymous) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }
}
