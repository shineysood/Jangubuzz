import { Component, OnInit, ViewChild, TemplateRef } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import * as firebase from "firebase/app";
import { HttpClient } from "@angular/common/http";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
  selector: "app-experience",
  templateUrl: "./experience.component.html",
  styleUrls: ["./experience.component.css"]
})
export class ExperienceComponent implements OnInit {
  book_flag = false;
  listing;
  reply;
  temp_reply;
  startDate;
  loading = true;
  comments_list = [];
  temp;
  temp1;
  replies = [];
  reply_input_flag;
  show_replies;
  comment;
  listing_user;
  listingId;
  tickets;
  ticket_listing;
  ticket_host;
  modalRef: BsModalRef;
  online_user;

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService
  ) {
    window.scroll(0, 0);
  }

  ngOnInit() {
    if (this.afAuth.auth.currentUser) {
      var online_user_doc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.afAuth.auth.currentUser.uid
      );
      online_user_doc.snapshotChanges().subscribe(data => {
        this.online_user = data.payload.data();
      });
      if (!this.afAuth.auth.currentUser.isAnonymous) {
        this.book_flag = true;
      }
    }

    this.route.params.subscribe(data => {
      this.listingId = data.id;
      this.getServiceListing(data.id);
      this.getComments(data.id);
      // this.getTickets(data.id);
    });
  }

  getServiceListing(id) {
    this.afs
      .doc("listing/" + id)
      .get()
      .subscribe(res => {
        this.listing = res.data();
        this.ticket_host = res.data().userId;
        this.ticket_listing = res.id;
        this.loading = false;
        this.listing.startDate = this.listing.startDate.toDate().toString();
        this.listing.endDate = this.listing.endDate.toDate().toString();

        console.log(this.listing.startDate);
        console.log(this.listing);

        // this.listing.startDay = this.listing.startDate.toDattoString().split(" ")[0];
        // this.listing.endDay = this.listing.endDate.toString().split(" ")[0];

        // to get the owner of the listing
        var listing_user: AngularFirestoreDocument = this.afs.doc(
          "user/" + this.listing.userId
        );
        listing_user.snapshotChanges().subscribe(user => {
          this.listing_user = user.payload.data().name;
        });
      });
  }

  // getTickets(listingId) {
  //   this.afs
  //     .collection(
  //       "user/" +
  //         this.afAuth.auth.currentUser.uid +
  //         "/listing/" +
  //         listingId +
  //         "/purchase"
  //     )
  //     .snapshotChanges()
  //     .subscribe(data => {
  //       data.forEach((item, i) => {
  //         if (data[i].payload.doc.id === "Inay89pTA8tIGKUUkeJZ") {
  //           console.log("=====> ", data[i].payload.doc.data());
  //         }
  //       });
  //     });
  // }

  buy_ticket(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  comments(id) {
    var comment_id = this.afs.createId();
    const comment_doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + id + "/listing/" + this.listingId + "/comment/" + comment_id
    );

    comment_doc
      .set(
        {
          message: this.comment,
          listingId: this.listingId,
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
          this.listingId +
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
            listingId: this.listingId,
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
          this.listingId +
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
            "user/" + this.temp_reply[i].payload.doc.data().userId
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
