import { Component, OnInit, TemplateRef } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { AngularFireFunctions } from "@angular/fire/functions";
import * as firebase from "firebase/app";
import { Subject } from "rxjs";

@Component({
  selector: "app-space-and-service",
  templateUrl: "./space-and-service.component.html",
  styleUrls: ["./space-and-service.component.css"]
})
export class SpaceAndServiceComponent implements OnInit {
  listing;
  startDate;
  loading = true;
  listing_user;
  listing_id;
  online_user;
  job_flag = false;
  comment;
  comments_list = [];
  temp;
  temp1;
  jobs = [];
  reply_input_flag;
  show_replies;
  replies;
  temp_replies;
  reply;
  temp_reply;
  temp_reviews;
  reviews = [];
  review_obj;
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private fns: AngularFireFunctions,
    private router: Router
  ) {
    window.scroll(0, 0);

    // if (this.afAuth.auth.currentUser) {
    //   if (!this.afAuth.auth.currentUser.isAnonymous) {
    //     this.job_flag = true;
    //   } else {
    //     this.job_flag = false;
    //   }
    // }
  }

  ngOnInit() {
    if (this.afAuth.auth.currentUser) {
      var online_user_doc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.afAuth.auth.currentUser.uid
      );
      online_user_doc.snapshotChanges().subscribe(data => {
        this.online_user = data.payload.data();
        this.online_user.uid = data.payload.id;
        console.log(this.online_user);
      });
      
    }

    this.route.params.subscribe(data => {
      this.listing_id = data.id;
      // this.getListingBookings(this.listing_id);
      this.getServiceListing(data.id);
      this.getComments(data.id);
      // if (this.afAuth.auth.currentUser) {
      //   // this.getJobs(this.afAuth.auth.currentUser.uid, data.id);
      // }
    });
  }

  book_service() {
    var hostId = this.listing.userId;
    var listingId = this.listing_id;
    this.router.navigate(["service/book", hostId, listingId]);
  }

  book_space() {
    var userId = this.afAuth.auth.currentUser.uid;
    var listingId = this.listing_id;
    this.router.navigate(["space/book", userId, listingId]);
  }

  getServiceListing(id) {
    this.afs
      .doc("listing/" + id)
      .snapshotChanges()
      .subscribe(res => {
        this.listing = res.payload.data();
        this.loading = false;
        console.log(this.listing);
        this.listing.startDate = this.listing.startDate.toDate();
        this.listing.endDate = this.listing.endDate.toDate();

        // to get the owner of the listing
        var listing_user: AngularFirestoreDocument = this.afs.doc(
          "user/" + this.listing.userId
        );

        // this.getReviews(, id);
        this.review_obj = {
          hostId: this.listing.userId,
          listingId: id
        };
        listing_user.snapshotChanges().subscribe(user => {
          this.listing_user = user.payload.data().name;
        });
      });
  }

  comments(id) {
    var comment_id = this.afs.createId();
    const comment_doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + id + "/listing/" + this.listing_id + "/comment/" + comment_id
    );

    comment_doc
      .set(
        {
          message: this.comment,
          listingId: this.listing_id,
          dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          dateModified: firebase.firestore.Timestamp.fromDate(new Date()),
          userId: this.afAuth.auth.currentUser.uid,
          baseUserId: id
        },
        { merge: true }
      )
      .then(data => {
        this.comment = "";
        comment_doc.snapshotChanges().subscribe(res => {
          console.log("comment: ", res.payload.data());
        });
      });
  }

  getComments(id) {
    console.log("getComments");
    this.afs
      .doc("listing/" + id)
      .snapshotChanges()
      .subscribe(data => {
        this.temp = data.payload.data();
        this.afs
          .collection(
            "user/" + this.temp.userId + "/listing/" + id + "/comment"
          )
          .snapshotChanges()
          .subscribe(comments => {
            this.comments_list = [];
            this.temp1 = comments;

            this.temp1.forEach((item, i) => {
              var user: AngularFirestoreDocument = this.afs.doc(
                "user/" + this.temp1[i].payload.doc.data().userId
              );
              user.snapshotChanges().subscribe(user => {
                var j = this.temp1[i].payload.doc.data();
                j.dateCreated = j.dateCreated.toDate();
                var comment = {
                  id: this.temp1[i].payload.doc.id,
                  comment: j,
                  userName: user.payload.data().name,
                  imageUrl: user.payload.data().profileImageUrl
                };
                this.comments_list.push(comment);
              });
            });

            console.log("comments: ", this.comments_list);
          });
      });
  }

  view_previous_replies(hostId, commentId) {
    this.replies = [];
    this.show_replies = commentId;
    this.getReplies(hostId, commentId);
  }

  reply_clicked(id) {
    if (this.reply_input_flag === "") {
      this.reply_input_flag = id;
    } else {
      this.reply_input_flag = "";
    }
  }

  hide_previous_replies() {
    this.show_replies = "";
  }

  comment_reply(comment_id, userId, baseUserId) {
    console.log(comment_id, userId, baseUserId);
    if (this.afAuth.auth.currentUser) {
      const reply_id = this.afs.createId();
      const reply_doc: AngularFirestoreDocument = this.afs.doc(
        "user/" +
          baseUserId +
          "/listing/" +
          this.listing_id +
          "/comment/" +
          comment_id +
          "/reply/" +
          reply_id
      );

      this.reply_input_flag = "";

      reply_doc
        .set(
          {
            message: this.reply,
            listingId: this.listing_id,
            commentId: comment_id,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: userId,
            baseUserId: baseUserId
          },
          { merge: true }
        )
        .then(res => {
          console.log("res: ", res);
          reply_doc.snapshotChanges().subscribe(data => {
            console.log(data.payload.data());
          });
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  getReplies(hostId, commentId) {
    this.afs
      .collection(
        "user/" +
          hostId +
          "/listing/" +
          this.listing_id +
          "/comment/" +
          commentId +
          "/reply"
      )
      .snapshotChanges()
      .subscribe(replies => {
        this.replies = [];
        this.temp_reply = replies;
        this.temp_reply.forEach((item, i) => {
          var user: AngularFirestoreDocument = this.afs.doc(
            "user/" + this.temp1[i].payload.doc.data().userId
          );
          user.snapshotChanges().subscribe(user => {
            var j = item.payload.doc.data();
            j.dateCreated = j.dateCreated.toDate();
            var reply = {
              id: item.payload.doc.id,
              reply: j,
              name: user.payload.data().name,
              imageUrl: user.payload.data().profileImageUrl
            };
            this.replies.push(reply);
          });
          console.log(this.replies);
        });
      });
  }
}
