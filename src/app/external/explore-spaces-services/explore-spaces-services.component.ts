import { Component, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";

@Component({
  selector: "app-explore-spaces-services",
  templateUrl: "./explore-spaces-services.component.html",
  styleUrls: ["./explore-spaces-services.component.css"]
})
export class ExploreSpacesServicesComponent implements OnInit {
  slides = [];
  spacesAndServices: Array<any> = [];
  listings;
  loading = false;

  slideConfig = {
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 3500,
    dots: false,
    infinite: true,
    arrows: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 1 } },
      { breakpoint: 992, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  constructor(private afs: AngularFirestore, private router: Router) {}

  ngOnInit() {
    this.loading = true;
    this.afs
      .collection("listing")
      .stateChanges() // for realtime updates
      .subscribe(listings => {
        this.listings = listings;
        this.listings.forEach((item, i) => {
          if (
            this.listings[i].payload.doc.data().listingType !==
            "eventListingType"
          ) {
            this.spacesAndServices.push({
              id: this.listings[i].payload.doc.id,
              payload: this.listings[i].payload.doc.data(),
              time: this.listings[i].payload.doc.data().dateCreated
            });
          }
        });
        this.loading = false;
      });
  }

  slickInit(e) {
    console.log("slick initialized");
  }

  breakpoint(e) {
    console.log("breakpoint");
  }

  afterChange(e) {
    console.log("afterChange");
  }

  beforeChange(e) {
    console.log("beforeChange");
  }

  open_listing(slide) {
    this.router.navigate(["listing/spaces-and-services", slide.id]);
  }
}
