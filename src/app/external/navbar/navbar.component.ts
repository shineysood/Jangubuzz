import { Component, OnInit, TemplateRef } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import * as $ from "src/assets/js/jquery.min.js";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { LoginService } from "../login/login.service";
import { AppService } from "src/app/app.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"]
})
export class NavbarComponent implements OnInit {
  user_logged_in = false;
  class;
  user_logged;
  modalRef_categories: BsModalRef;
  isPhotoExist;
  modalRef: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private appService: AppService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private loginService: LoginService
  ) {
    // this.appService.userLoggedObs().subscribe(res => {
    //   console.log("=====> user logged navbar: ", res);
    //   this.user_logged_fun(res.uid);
    // });

    this.loginService.loggedInObs().subscribe(res => {
      if (res.login_flag) {
        if (this.afAuth.auth.currentUser) {
          if (!this.afAuth.auth.currentUser.isAnonymous) {
            this.user_logged_fun(this.afAuth.auth.currentUser.uid);
          }
        }
      }
    });

    this.router.events.subscribe(path => {
      if (path instanceof NavigationEnd) {
        if (
          document.getElementsByClassName("navbar-collapse collapse show")
            .length !== 0
        ) {
          $("#toggler-btn").click();
        }

        if (path.url.indexOf("home") > 0) {
          this.class = "";
        } else if (path.url !== "/") {
          this.class = "with_bg";
        } else {
          this.class = "";
        }
      }
    });
  }

  ngOnInit() {}

  navigateToHome() {
    this.router.navigateByUrl("/home");
  }

  host_modal(template: TemplateRef<any>) {
    this.modalRef_categories = this.modalService.show(template);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  signout() {
    this.afAuth.auth.signOut().then(res => {
      window.location.href = "/";
    });
  }

  user_logged_fun(id){
    const userDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + id
    );
    userDoc.snapshotChanges().subscribe(data => {
      var user = data.payload.data();
      console.log("===> doc user: ", user);
      this.user_logged = {
        displayName: user.name,
        photoURL: user.profileImageUrl,
        emailVerified: user.emailVerified
      };
    });
  }

  onClickedOutside(e: Event) {
    if (
      document.getElementsByClassName("navbar-collapse collapse show")
        .length !== 0
    ) {
      $("#toggler-btn").click();
    }
  }
}
