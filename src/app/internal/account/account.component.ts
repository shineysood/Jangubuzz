import { Component, OnInit, TemplateRef } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import { FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Validators } from "@angular/forms";
// import { EmailAuthProvider } from "@firebase/auth-types";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";

@Component({
  selector: "app-account",
  templateUrl: "./account.component.html",
  styleUrls: ["./account.component.css"]
})
export class AccountComponent implements OnInit {
  matched = false;
  modalRef: BsModalRef;
  user_logged: any;
  providerId = "password";
  public resetPassForm: FormGroup;
  public changeEmailForm: FormGroup;
  public authenticateForm: FormGroup;

  constructor(
    public afAuth: AngularFireAuth,
    private fb: FormBuilder,
    private modalService: BsModalService,
    private router: Router
  ) {
    if (this.afAuth.auth.currentUser) {
      this.providerId = this.afAuth.auth.currentUser.providerData[0].providerId;
    }

    this.resetPassForm = this.fb.group({
      currentPass: ["", Validators.required],
      newPass: ["", Validators.required],
      confirmPass: ["", Validators.required]
    });

    this.changeEmailForm = this.fb.group({
      newEmail: ["", Validators.required]
    });

    this.authenticateForm = this.fb.group({
      authenticatePassword: ["", Validators.required]
    });
  }

  ngOnInit() {}

  resetPassword() {
    if (this.resetPassForm.valid) {
      var email = this.afAuth.auth.currentUser.providerData[0].email.toString();
      var currPassword = this.resetPassForm.controls["currentPass"].value;
      var confirmPass = this.resetPassForm.controls["confirmPass"].value;
      this.authenticateUser(email, currPassword)
        .then(data => {
          // if authenticateUser() doesn't throw an error so it will proceed to the next step
          this.afAuth.auth.currentUser
            .updatePassword(confirmPass)
            .then(data => {
              alert("Password updated successfully");
            })
            .catch(error => {
              console.log("error: ", error);
              return false;
            });
        })
        .catch(error => {
          console.log("error: ", error);
          return false;
        });
    } else {
      Object.keys(this.resetPassForm.controls).forEach(key => {
        this.resetPassForm.controls[key].markAsTouched({ onlySelf: true });
      });
    }
  }

  signout() {
    this.afAuth.auth.signOut().then(res => {
      localStorage.clear();
      this.router.navigateByUrl("/");
    });
  }

  changeEmail() {
    var email = this.afAuth.auth.currentUser.providerData[0].email.toString();
    var newEmail = this.changeEmailForm.controls["newEmail"].value;
    var password = this.authenticateForm.controls["authenticatePassword"].value;
    this.authenticateUser(email, password)
      .then(data => {
        this.afAuth.auth.currentUser
          .updateEmail(newEmail)
          .then(data => {
            alert("Email updated successfully");
          })
          .catch(error => {
            console.log("error: ", error);
            if (error.code === "auth/email-already-in-use") {
              if (window.confirm(error.message)) {
                this.modalRef.hide();
              }
            }
            return false;
          });
      })
      .catch(error => {
        console.log("error: ", error);
        return false;
      });
  }

  openModal(template: TemplateRef<any>) {
    if (this.changeEmailForm.valid) {
      this.modalRef = this.modalService.show(template);
    } else {
      Object.keys(this.changeEmailForm.controls).forEach(key => {
        this.changeEmailForm.controls[key].markAsTouched({ onlySelf: true });
      });
    }
  }

  authenticateUser(email, password) {
    var cred = firebase.auth.EmailAuthProvider.credential(
      email.toString(),
      password.toString()
    );
    return firebase.auth().currentUser.reauthenticateWithCredential(cred);
  }

  confirmPass() {
    if (
      this.resetPassForm.controls["newPass"].value ===
      this.resetPassForm.controls["confirmPass"].value
    ) {
      this.matched = true;
    } else {
      this.matched = false;
    }
  }
}
