import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestoreDocument } from "@angular/fire/firestore";
import { AngularFirestore } from "@angular/fire/firestore";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import * as $ from "jquery";

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

  readmore() {
    $(document).ready(function() {
      var maxLength = 500;
      $(".show-read-more").each(function() {
        var myStr = $(this).text();
        if ($.trim(myStr).length > maxLength) {
          var newStr = myStr.substring(0, maxLength);
          var removedStr = myStr.substring(maxLength, $.trim(myStr).length);
          $(this)
            .empty()
            .html(newStr);
          $(this).append(
            ' <a href="javascript:void(0);" class="read-more">.....</a>'
          );
          $(this).append('<span class="more-text">' + removedStr + "</span>");
          $(this).append(
            ' <a href="javascript:void(0);" class="read-less" >read less</a>'
          );
          
        }
      });

      $(".read-more").click(function() {
        $(this)
          .siblings(".more-text").show();          
          $(".read-less").show();
          $(this).hide();
      });      
      $(".read-less").click(function() {
        $(this)
          .siblings(".more-text")
          .hide();
          $(".read-more").show();
        $(this).hide();
      });

    });
  }

  ngOnInit() {
    this.afs
      .collection("listing")
      .snapshotChanges()
      .subscribe(list => {
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
        console.log(this.user_listings);
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

        // setTimeout(() => {
          this.readmore();
        // });
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
}
