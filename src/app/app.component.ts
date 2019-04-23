import { Component } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  ngOnInit() {
    if (!this.afAuth.auth.currentUser) {
      this.guestLogin();
    }
    // this.router.navigateByUrl("/");
  }

  guestLogin() {
    this.afAuth.auth
      .signInAnonymously()
      .then(result => {
        console.log("current_User: ", this.afAuth.auth.currentUser);
      })
      .catch(error => {
        console.log("error: ", error);
      });
  }
}
