import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireDatabase } from "@angular/fire/database";
// import { AngularFireStorage } from "@angular/fire/storage";
import { FormGroup, FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { AngularFireStorage } from "@angular/fire/storage";

@Component({
  selector: "app-profile-update",
  templateUrl: "./profile-update.component.html",
  styleUrls: ["./profile-update.component.css"]
})
export class ProfileUpdateComponent implements OnInit {
  @Input() modalRef: BsModalRef;
  @Input() name;
  @Input() photoURL;
  @Input() bio;
  @Input() dob;
  bsValue;
  pic_loader = false;
  imageURL;
  public updateProfileForm: FormGroup;

  constructor(
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public afd: AngularFireDatabase,
    public store: AngularFireStorage,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.updateProfileForm = this.fb.group({
      name: [""],
      bio: [""],
      dob: [""]
    });
  }

  ngOnInit() {
    this.imageURL = this.photoURL;
    this.updateProfileForm.controls["name"].patchValue(this.name);
    this.updateProfileForm.controls["bio"].patchValue(this.bio);
  }

  updateProfileImage(event) {
    this.pic_loader = true;
    // this.photoURLI
    this.store.storage
      .ref()
      .child("user")
      .child(this.afAuth.auth.currentUser.uid)
      .child("image.jpg")
      .put(event.target.files[0])
      .then(uploadSnap => {
        uploadSnap.ref.getDownloadURL().then(downloadURL => {
          this.imageURL = downloadURL;
          this.photoURL = this.imageURL;
          this.pic_loader = false;
          console.log(this.imageURL);
        });
      });
  }

  updateProfile() {
    const userDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid
    );

    const userBirthDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid + "/private/birthDate"
    );

    console.log("date: ", this.updateProfileForm.controls["dob"].value);

    userDoc.set(
      {
        name: this.updateProfileForm.controls["name"].value, //String
        bio: this.updateProfileForm.controls["bio"].value, //String
        dateModified: new Date(), //current date or timestamp
        profileImageUrl: this.imageURL //String
      },
      {
        merge: true
      }
    );

    if (this.updateProfileForm.controls["dob"].value) {
      userBirthDoc.set(
        {
          birthDate: this.updateProfileForm.controls["dob"].value,
          dateModified: new Date()
        },
        {
          merge: true
        }
      );
    }

    this.afAuth.auth.currentUser
      .updateProfile({
        displayName: this.updateProfileForm.controls["name"].value, //Name gotten from user (String)
        photoURL: this.imageURL //Leave this as an empty String
      })
      .then(data => {
        this.modalRef.hide();
      })
      .catch(error => {
        console.log("error: ", error);
      });
  }
}
