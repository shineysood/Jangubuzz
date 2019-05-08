import { Component, OnInit, TemplateRef, Input } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import * as moment from "moment";
import Swal from "sweetalert2";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

@Component({
  selector: "app-ticket-type",
  templateUrl: "./ticket-type.component.html",
  styleUrls: ["./ticket-type.component.css"]
})
export class TicketTypeComponent implements OnInit {
  @Input() modalRef: BsModalRef;
  @Input() hostId;
  @Input() listingId;
  temp_tickets;
  tickets: Observable<any[]>;

  constructor(
    private modalService: BsModalService,
    private afs: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.getTickets(this.hostId, this.listingId);
  }

  getTickets(hostId, listingId) {
    var ticketCollection = this.afs.collection(
      "user/" + hostId + "/listing/" + listingId + "/ticket"
    );

    this.tickets = ticketCollection.stateChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { id, ...data };
        })
      )
    );
  }

  buy_ticket(ticketId, saleEndDate, ticketsLeft) {
    if (ticketsLeft > 0 && moment(saleEndDate.toDate().toString()).isAfter(new Date())) {
      this.modalRef.hide();
      this.router.navigate([
        "ticket/buy",
        ticketId,
        this.hostId,
        this.listingId
      ]);
    } else {
      Swal.fire("", "Something went wrong", "error");
    }
  }
}
