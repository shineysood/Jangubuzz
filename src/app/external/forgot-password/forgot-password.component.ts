import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Validators } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from "firebase/app";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.css"],
  providers: [AngularFireAuth]
})
export class ForgotPasswordComponent implements OnInit {
  @Input() modalRef: BsModalRef;
  EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  public forgotForm: FormGroup;

  constructor(private fb: FormBuilder, private afAuth: AngularFireAuth) {
    this.forgotForm = this.fb.group({
      forgotEmail: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.EMAIL_REGEX)
        ])
      ]
    });
  }

  ngOnInit() {}

  sendLink() {
    if (this.forgotForm.valid) {
      var that = this;
      this.afAuth.auth
        .sendPasswordResetEmail(this.forgotForm.controls["forgotEmail"].value)
        .then(function(result) {
          alert(
            "Link has sent to your email address " +
              that.forgotForm.controls["forgotEmail"].value
          );
          that.modalRef.hide();
        })
        .catch(function(error) {
          console.log("error: ", error);
        });
    } else {
      console.log(this);
      Object.keys(this.forgotForm.controls).forEach(key => {
        this.forgotForm.controls[key].markAsTouched({ onlySelf: true });
      });
    }
  }
}
