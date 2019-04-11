import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  modalRef: BsModalRef;
  user_logged;
  dob;
  bio;
  loading = false;
  photoURL;
  name;
  verifications = {
    name: "",
    emailVerified: false
  };
  constructor(
    private modalService: BsModalService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    const userDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid
    );

    const userBirthDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.afAuth.auth.currentUser.uid + "/private/birthDate"
    );

    userDoc.snapshotChanges().subscribe(data => {
      const userBirthDoc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.afAuth.auth.currentUser.uid + "/private/birthDate"
      );

      userBirthDoc.snapshotChanges().subscribe(birthDate => {
        var user = data.payload.data();
        var dob = birthDate.payload.data();
        this.user_logged = {
          bio: user.bio,
          dob: dob.birthDate,
          displayName: user.name,
          photoURL: user.profileImageUrl
        };

        this.verifications = {
          name: this.user_logged.displayName.split(" ")[0],
          emailVerified: this.afAuth.auth.currentUser.emailVerified
        };
      });
    });
  }

  openModal(template: TemplateRef<any>) {
    console.log(this.user_logged.photoURL, this.user_logged.bio);
    this.name = this.user_logged.displayName;
    this.photoURL = this.user_logged.photoURL;
    this.dob = this.user_logged.dob;
    this.bio = this.user_logged.bio;
    this.modalRef = this.modalService.show(template);
  }
}
