import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/firestore";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.css"]
})
export class ProfileComponent implements OnInit {
  modalRef: BsModalRef;
  user_logged;
  dob;
  user_bookings = [];
  bio;
  loading = false;
  photoURL;
  name;
  verifications = {
    name: "",
    emailVerified: false,
    phoneNumber: ""
  };
  all_listings;
  user_listings = [];
  constructor(
    private modalService: BsModalService,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUserBookings().subscribe(data => {
      // this.user_bookings = [];
      data.forEach((item, i) => {
        var obj = {
          id: data[i].payload.doc.id,
          payload: data[i].payload.doc.data()
        };
        this.user_bookings.push(obj);
      });
    });

    this.afs
      .collection("listing")
      .snapshotChanges()
      .subscribe(list => {
        // this.user_listings = [];
        this.all_listings = list;
        list.forEach((item, i) => {
          if (
            this.all_listings[i].payload.doc.data().userId ===
            this.afAuth.auth.currentUser.uid
          ) {
            var listing = {
              id: this.all_listings[i].payload.doc.id,
              payload: this.all_listings[i].payload.doc.data()
            };
            this.user_listings.push(listing);
          }
        });
      });

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
          emailVerified: this.afAuth.auth.currentUser.emailVerified,
          phoneNumber: ""
        };
      });
    });
  }

  create_ticket(listingId, userId) {
    this.router.navigate(["ticket/create", listingId, userId]);
  }

  openModal(template: TemplateRef<any>) {
    this.name = this.user_logged.displayName;
    this.photoURL = this.user_logged.photoURL;
    this.dob = this.user_logged.dob;
    this.bio = this.user_logged.bio;
    this.modalRef = this.modalService.show(template);
  }

  shareProfile() {
    var link =
      "http://" +
      environment.baseUrl.domain +
      ":" +
      environment.baseUrl.port +
      "/user/" +
      this.afAuth.auth.currentUser.uid;
    console.log(link);
  }

  // delete_listing(id) {
  //   this.afs
  //     .collection("listing")
  //     .doc(id.toString())
  //     .delete()
  //     .then(res => {
  //       console.log(res);
  //     })
  //     .catch(err => {
  //       console.log("error: ", err);
  //     });
  // }

  getUserBookings() {
    return this.afs
      .collection("user/" + this.afAuth.auth.currentUser.uid + "/booking")
      .snapshotChanges();
  }
}
