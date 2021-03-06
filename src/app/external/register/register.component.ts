import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { AngularFireAuth } from "@angular/fire/auth";
import { auth } from "firebase/app";
import { BsModalRef } from "ngx-bootstrap/modal";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import Swal from "sweetalert2";
import {
  BsDaterangepickerDirective,
  BsDatepickerConfig
} from "ngx-bootstrap/datepicker";
import { Router } from "@angular/router";
import { LoginService } from '../login/login.service';

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"]
})
export class RegisterComponent implements OnInit {
  EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  bsValue;
  public registerForm: FormGroup;
  @Input() modalRef: BsModalRef;
  @Output() cancelRegistration: EventEmitter<any> = new EventEmitter();

  @ViewChild("dp") datepicker: BsDaterangepickerDirective;

  bsConfig: Partial<BsDatepickerConfig>;
  maxDate: Date;

  constructor(
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService
  ) {
    this.registerForm = this.fb.group({
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern(this.EMAIL_REGEX)
        ])
      ],
      password: ["", Validators.required],
      name: ["", Validators.required],
      dob: ["", Validators.required]
    });
  }

  ngOnInit() {
    this.maxDate = new Date();
  }

  ngAfterViewChecked(): void {
    //Called after every check of the component's view. Applies to components only.
    //Add 'implements AfterViewChecked' to the class.
    this.bsConfig = Object.assign({}, { maxDate: this.maxDate });
    this.datepicker.setConfig();
  }

  register(event) {
    if (this.registerForm.valid) {
      var that = this;
      this.afAuth.auth
        .createUserWithEmailAndPassword(
          this.registerForm.controls["email"].value,
          this.registerForm.controls["password"].value
        )
        .then(function(result) {
          console.log("====>", result);
          // set user's name, lastLogin, dateModified, dateCreated, birthDate
          const userDoc: AngularFirestoreDocument = that.afs.doc(
            "user/" + that.afAuth.auth.currentUser.uid
          );

          const userBirthDoc: AngularFirestoreDocument = that.afs.doc(
            "user/" + that.afAuth.auth.currentUser.uid + "/private/birthDate"
          );

          userBirthDoc.set(
            {
              birthDate: that.registerForm.controls["dob"].value //date ----- Min 14 yrs
            },
            { merge: true }
          );

          userDoc
            .set(
              {
                name: that.registerForm.controls["name"].value, //String
                lastLogin: new Date(), //current date or timestamp
                dateModified: new Date(), //current date or timestamp
                dateCreated: new Date() //current date or timestamp
              },
              {
                merge: true
              }
            )
            .then(data => {
              that.afAuth.auth
                .signInWithEmailAndPassword(
                  that.registerForm.controls["email"].value,
                  that.registerForm.controls["password"].value
                )
                .then(result => {
                  that.modalRef.hide();
                  that.loginService.loggedIn();
                  Swal.fire("", "Registered successfully", "success");
                });
            });

          // Update user provider data
          that.afAuth.auth.currentUser.updateProfile({
            displayName: that.registerForm.controls["name"].value, // Name gotten from user (String)
            photoURL: "" // Leave this as an empty String
          });

          // send verification email
          that.afAuth.auth.currentUser.sendEmailVerification();
          // Send them into the app

          // that.cancel();
        })
        .catch(function(error) {
          Swal.fire(error.code, error.message, "error");
        });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.controls[key].markAsTouched({ onlySelf: true });
      });
    }
  }

  cancel() {
    // to move to login page from registration page
    this.cancelRegistration.emit();
  }
}
