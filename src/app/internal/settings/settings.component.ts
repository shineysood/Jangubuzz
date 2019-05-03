import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.css"]
})
export class SettingsComponent implements OnInit {
  user_logged;
  constructor(private afAuth: AngularFireAuth) {
    if (this.afAuth.auth.currentUser) {
      if (!this.afAuth.auth.currentUser.isAnonymous) {
        this.user_logged = this.afAuth.auth.currentUser.providerData[0];
      }
    }
  }

  ngOnInit() {
    console.log("===> user logged: ", this.user_logged);
  }
}
