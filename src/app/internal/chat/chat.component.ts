import { Component, OnInit } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router, ActivatedRoute } from "@angular/router";
import * as firebase from "firebase/app";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit {
  chat_receiver;
  user_temp;
  chat_receiver_id;
  messages = [];
  message_temp;
  message;
  bookingId;
  book_card = {};
  booking_user_id;
  listing_card = {};
  temp;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log("params: ", params);
      if (params.isBooking === "yes") {
        console.log("creating card", params.bookingId);

        const doc: AngularFirestoreDocument = this.afs.doc(
          "user/" + params.userId + "/booking/" + params.bookingId
        );

        doc.snapshotChanges().subscribe(data => {
          this.getMessages(data.payload.data().hostId);

          this.getUser(data.payload.data().hostId);

          const book_ref_doc: AngularFirestoreDocument = this.afs.doc(
            "user/" +
              data.payload.data().userId +
              "/message/" +
              data.payload.data().hostId
          );
          var threadId = this.afs.createId();
          const book_ref_doc1: AngularFirestoreDocument = this.afs.doc(
            "user/" +
              data.payload.data().userId +
              "/message/" +
              data.payload.data().hostId +
              "/thread/" +
              threadId
          );

          book_ref_doc.set(
            {
              userId: data.payload.data().hostId,
              dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
              dateModified: firebase.firestore.Timestamp.fromDate(new Date())
            },
            { merge: true }
          );

          book_ref_doc1.set(
            {
              message: "",
              bookingId: this.bookingId,
              listingId: data.payload.data().listingId,
              hostId: data.payload.data().hostId,
              userId: data.payload.data().userId,
              dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
              dateModified: firebase.firestore.Timestamp.fromDate(new Date()),
              isBooking: true,
              isHome: true
            },
            { merge: true }
          );
        });
      } else if (params.isBooking === "no") {
        this.getUser(params.userId);
        this.getMessages(params.userId);
      }
    });
  }

  getUser(id) {
    this.afs
      .doc("user/" + id)
      .snapshotChanges()
      .subscribe(user => {
        this.chat_receiver = user.payload.data();
        this.chat_receiver.uid = user.payload.id;
        console.log("chat user: ", this.chat_receiver);
      });
  }

  getMessages(hostId) {
    this.afs
      .collection(
        "user/" +
          this.afAuth.auth.currentUser.uid +
          "/message/" +
          hostId +
          "/thread/"
      )
      .snapshotChanges()
      .subscribe(messages => {
        this.message_temp = messages;
        this.message_temp.forEach((item, i) => {
          if (this.message_temp[i].payload.doc.data().isBooking) {
            this.bookingId = this.message_temp[
              i
            ].payload.doc.data().bookingId,
              this.booking_user_id = this.message_temp[
                i
              ].payload.doc.data().userId;
          }

          var obj = {
            id: this.message_temp[i].payload.doc.id,
            message: this.message_temp[i].payload.doc.data(),
            time: this.message_temp[i].payload.doc
              .data()
              .dateCreated.toDate()
              .toString()
          };
          this.messages.push(obj);
        });
        this.getBooking(this.booking_user_id, this.bookingId);
        console.log("====> chat messages: ", this.messages);
      });
  }

  send(id) {
    const doc1: AngularFirestoreDocument = this.afs.doc(
      "user/" +
        this.afAuth.auth.currentUser.uid +
        "/message/" +
        this.chat_receiver_id
    );

    const threadId = this.afs.createId();
    const doc2: AngularFirestoreDocument = this.afs.doc(
      "user/" +
        this.afAuth.auth.currentUser.uid +
        "/message/" +
        this.chat_receiver_id +
        "/thread/" +
        threadId
    );

    doc1.set(
      {
        userId: this.chat_receiver_id,
        dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
        dateModified: firebase.firestore.Timestamp.fromDate(new Date())
      },
      { merge: true }
    );

    doc2.set(
      {
        message: this.message,
        dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
        isHome: true
      },
      { merge: true }
    );

    this.message = "";
    document.getElementById("message_box").focus();
  }

  getBooking(userId, bookingId) {
    console.log("yessss", bookingId, userId);
    const doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + userId + "/booking/" + bookingId
    );

    doc.snapshotChanges().subscribe(res => {
      this.book_card = res.payload.data();
      console.log("=====> book card: ", this.book_card);
      this.afs
        .doc(
          "user/" +
            res.payload.data().hostId +
            "/listing/" +
            res.payload.data().listingId
        )
        .snapshotChanges()
        .subscribe(data => {
          console.log("listing card: ", data.payload.data());
          this.temp = data.payload.data();
          this.listing_card = {
            title: this.temp.title,
            date: this.temp.dateCreated.toDate().toString(),
            policy: this.temp.policy,
            service: this.temp.service,
            perHourPrice: this.temp.perHourPrice,
            listingImageUrl: this.temp.listingImageUrl,
            address: this.temp.locationShortAddress,
            listingType: this.temp.listingType,
            name:
              this.temp.listingType === "eventServiceListingType"
                ? this.temp.service
                : this.temp.locationName
          };
        });
    });
  }
}
