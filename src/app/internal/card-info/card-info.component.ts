import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";

@Component({
  selector: "app-card-info",
  templateUrl: "./card-info.component.html",
  styleUrls: ["./card-info.component.css"]
})
export class CardInfoComponent implements OnInit {
  @Input() modalRef: BsModalRef;

  public cardInfoForm: FormGroup;

  constructor(private router: Router, private fb: FormBuilder) {
    this.cardInfoForm = this.fb.group({
      cardName: ["", Validators.required],
      cardNumber: ["", Validators.required],
      cardCvc: ["", Validators.required],
      expMonth: ["", Validators.required],
      expYear: ["", Validators.required]
    });
  }

  ngOnInit() {}

  addCard() {
    if (this.cardInfoForm.valid) {
      console.log("add card function");
    } else {
      Object.keys(this.cardInfoForm.controls).forEach(key => {
        this.cardInfoForm.controls[key].markAsTouched({ onlySelf: true });
      });
    }
  }
}
