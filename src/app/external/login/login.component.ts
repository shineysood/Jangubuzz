import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from "firebase/app";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import * as firebase from "firebase/app";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  loggingIn = false;
  userType;
  active = "login";
  @Input() modalRef: BsModalRef;
  public loginForm: FormGroup;
  EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  constructor(
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {
    this.loginForm = this.fb.group({
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.EMAIL_REGEX)
        ])
      ],
      password: ["", Validators.required]
    });
  }

  ngOnInit() {}

  googleLogin() {
    if (this.afAuth.auth.currentUser) {
      if (this.afAuth.auth.currentUser.isAnonymous) {
        this.afAuth.auth.currentUser.delete();
      }
    }

    this.afAuth.auth
      .signInWithPopup(new auth.GoogleAuthProvider())
      .then(result => {
        // get the user if already exists
        const user = this.afs
          .collection("user")
          .doc(this.afAuth.auth.currentUser.uid)
          .get()
          .subscribe(user_data => {
            // if exists
            if (user_data.exists) {
              const userDoc: AngularFirestoreDocument = this.afs.doc(
                "user/" + this.afAuth.auth.currentUser.uid
              );
              userDoc.set(
                {
                  lastLogin: new Date(),
                  dateModified: new Date()
                },
                {
                  merge: true
                }
              );
            } else {
              // if not exist
              const userBirthDoc: AngularFirestoreDocument = this.afs.doc(
                "user/" +
                  this.afAuth.auth.currentUser.uid +
                  "/private/birthDate"
              );
              userBirthDoc.set(
                {
                  birthDate: new Date(),
                  dateModified: new Date()
                },
                {
                  merge: true
                }
              );

              const userDoc: AngularFirestoreDocument = this.afs.doc(
                "user/" + this.afAuth.auth.currentUser.uid
              );
              userDoc.set(
                {
                  name: this.afAuth.auth.currentUser.providerData[0]
                    .displayName,
                  lastLogin: new Date(),
                  dateModified: new Date(),
                  dateCreated: new Date()
                },
                {
                  merge: true
                }
              );
              //send verification email
              this.afAuth.auth.currentUser.sendEmailVerification();
              alert(
                "Activation link has sent to " +
                  this.afAuth.auth.currentUser.email
              );
            }
            this.modalRef.hide();
            this.router.navigateByUrl("/");
          });
      })
      .catch(err => {
        console.log("error: ", err);
      });
  }

  login() {
    if (this.afAuth.auth.currentUser) {
      if (this.afAuth.auth.currentUser.isAnonymous) {
        this.afAuth.auth.currentUser.delete();
      }
    }
    if (this.loginForm.valid) {
      this.loggingIn = true;
      var email = this.loginForm.controls["email"].value;
      var password = this.loginForm.controls["password"].value;

      var that = this;

      this.afAuth.auth
        .signInWithEmailAndPassword(email, password)
        .then(result => {
          firebase
            .auth()
            .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(function() {
              return firebase
                .auth()
                .signInWithEmailAndPassword(
                  that.loginForm.controls["email"].value,
                  that.loginForm.controls["password"].value
                );
            });

          this.modalRef.hide();
          this.router.navigateByUrl("/");
          this.loggingIn = false;
        })
        .catch(err => {
          this.spinner.hide();
          this.loggingIn = false;
          console.log("error: ", err);
          if (err.code === "auth/wrong-password") {
            if (window.confirm(err.message)) {
              this.loginForm.controls["password"].reset();
            } else {
              this.modalRef.hide();
            }
          } else if (err.code === "auth/user-not-found") {
            if (window.confirm(err.message)) {
              this.loginForm.reset();
            } else {
              this.modalRef.hide();
            }
          }
        });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.controls[key].markAsTouched({ onlySelf: true });
      });
    }
  }

  forgotPassword() {
    this.active = "forgotPassword";
  }

  registerClicked() {
    this.active = "register";
  }

  cancelRegistration() {
    this.active = "login";
  }
}
