import { Component, OnInit, TemplateRef, Input } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

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
  tickets;

  constructor(
    private modalService: BsModalService,
    private afs: AngularFirestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.getTickets(this.hostId, this.listingId);
  }

  getTickets(hostId, listingId) {
    this.afs
      .collection("user/" + hostId + "/listing/" + listingId + "/ticket")
      .snapshotChanges()
      .subscribe(tickets => {
        this.tickets = [];
        if (tickets.length !== 0) {
          this.temp_tickets = tickets;
          this.temp_tickets.forEach((item, i) => {
            var t = item.payload.doc.data();
            t.saleEndDate = t.saleEndDate.toDate().toString();
            var ticket = {
              id: item.payload.doc.id,
              payload: t
            };
            this.tickets.push(ticket);
          });
        }
        console.log(this.tickets);
      });
  }

  buy_ticket(ticketId) {
    this.modalRef.hide();
    this.router.navigate(["ticket/buy", ticketId, this.hostId, this.listingId]);
  }
}