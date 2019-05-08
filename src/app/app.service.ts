import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class AppService {
  user_subject = new Subject<any>();
  constructor() {}

  userLoggedObs(){
    return this.user_subject.asObservable();
  }

  loggedIn(data) {
    return this.user_subject.next(data);
  }
}
