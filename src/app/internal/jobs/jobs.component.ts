import { Component, OnInit, Input, TemplateRef } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AngularFireAuth } from "@angular/fire/auth";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireFunctions } from "@angular/fire/functions";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-jobs",
  templateUrl: "./jobs.component.html",
  styleUrls: ["./jobs.component.css"]
})
export class JobsComponent implements OnInit {
  review_obj;
  modalRef: BsModalRef;
  @Input() listingId;
  jobs: Observable<any[]>;
  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private route: ActivatedRoute,
    private fns: AngularFireFunctions,
    private router: Router,
    private modalService: BsModalService
  ) {}

  ngOnInit() {
    this.getBookings(this.afAuth.auth.currentUser.uid, this.listingId);
  }

  approve(id, hostId, listingId) {
    const job_doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + hostId + "/listing/" + listingId + "/job/" + id
    );

    job_doc
      .set(
        {
          isHostApproved: true
        },
        { merge: true }
      )
      .then(res => {
        job_doc.snapshotChanges().subscribe(data => {
          console.log(data.payload.data());
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  cancel(id, hostId, listingId) {
    const job_doc: AngularFirestoreDocument = this.afs.doc(
      "user/" + hostId + "/listing/" + listingId + "/job/" + id
    );

    job_doc
      .set(
        {
          isCanceled: true
        },
        { merge: true }
      )
      .then(res => {
        job_doc.snapshotChanges().subscribe(data => {
          console.log(data.payload.data());
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  getBookings(userId, listingId) {
    var jobsCollection = this.afs.collection(
      "user/" + userId + "/listing/" + listingId + "/job",
      ref => ref.orderBy("dateCreated", "desc")
    );

    this.jobs = jobsCollection.stateChanges(["added"]).pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  review(template: TemplateRef<any>, userId, hostId, listingId, bookingId) {
    this.review_obj = {
      type: "host",
      bookingId: bookingId,
      listingId: listingId,
      hostId: hostId,
      userId: userId
    };
    this.modalRef = this.modalService.show(template);
  }

  message(bookingId, listingId) {
    var isBooking = "yes";
    var type = "host";
    this.router.navigate([
      "message/host/booking",
      type,
      isBooking,
      bookingId,
      listingId
    ]);
  }
}
