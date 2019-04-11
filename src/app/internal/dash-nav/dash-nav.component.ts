import { Component, OnInit } from "@angular/core";
import * as $ from "src/assets/js/jquery.min.js";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { ProfileComponent } from "../profile/profile.component";

@Component({
  selector: "app-dash-nav",
  templateUrl: "./dash-nav.component.html",
  styleUrls: ["./dash-nav.component.css"]
})
export class DashNavComponent implements OnInit {
  user_logged = {
    displayName: "",
    photoURL: ""
  };
  isPhotoExist = false;
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    // if (!this.afAuth.auth.currentUser.isAnonymous) {
    const userDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid
    );

    userDoc.get().subscribe(data => {
      var user = data.data();
      this.user_logged = {
        displayName: user.name,
        photoURL: user.profileImageUrl
      };
      if (user.profileImageUrl) {
        this.isPhotoExist = true;
      } else if (user.profileImageUrl !== "") {
        this.isPhotoExist = true;
      }
    });
    // }
  }

  logout() {
    this.afAuth.auth.signOut().then(res => {
      this.router.navigateByUrl("/");
    });
  }
}
