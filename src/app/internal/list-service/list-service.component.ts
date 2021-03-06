import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  Input
} from "@angular/core";
import * as moment from "moment";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { google } from "@google/maps";
import { MapsAPILoader } from "@agm/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireStorage } from "@angular/fire/storage";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AmazingTimePickerService } from "amazing-time-picker";
import ImageCompressor from "image-compressor.js";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";

declare var google: any;

@Component({
  selector: "app-list-service",
  templateUrl: "./list-service.component.html",
  styleUrls: ["./list-service.component.css"]
})
export class ListServiceComponent implements OnInit {
  @Input() userId;
  place_changed = false;
  @Input() listingType;
  geoPoint: any;
  amenities;
  step = "basic";
  public latitude: number;
  public longitude: number;
  public service_form_basic: FormGroup;
  public service_form_additional: FormGroup;
  public zoom: number;
  pic_loader = false;
  listingId;
  listing_event_image_url;
  locationBrokenAddess_temp;
  temp;
  services: Observable<any[]>;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public afd: AngularFireDatabase,
    public store: AngularFireStorage,
    private atp: AmazingTimePickerService,
    private router: Router
  ) {
    this.service_form_additional = this.fb.group({
      service: [""],
      endDate: ["", Validators.required],
      listingImageUrl: [""],
      listingType: [""],
      locationAddress: ["", Validators.required],
      locationBrokenAddress: [""],
      locationShortAddress: [""],
      minHour: ["", Validators.required],
      startDate: ["", Validators.required],
      perHourPrice: ["", Validators.required]
    });

    this.service_form_basic = this.fb.group({
      title: ["", Validators.required],
      currency: [""],
      description: ["", Validators.required],
      policy: [""]
    });
  }

  ngOnInit() {
    var servicesCollection = this.afs.collection("services");

    this.services = servicesCollection.stateChanges().pipe(
      map(actions =>
        actions.map(a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data();
          return { id, ...data };
        })
      )
    );

    this.service_form_basic.controls["policy"].patchValue("no");
    this.service_form_basic.controls["currency"].patchValue("cad");

    this.route.params.subscribe(data => {
      this.userId = data.userId;
      this.listingType = data.listingType;
    });
  }

  loadGoogleMaps() {
    //set google maps defaults
    // this.zoom = 4;
    // this.latitude = 39.8282;
    // this.longitude = -98.5795;

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(
        this.searchElementRef.nativeElement,
        {
          types: ["address"]
        }
      );
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          // this.place_changed = true;
          this.service_form_additional.controls["locationAddress"].patchValue(
            place.formatted_address
          );

          this.locationBrokenAddess_temp = place.address_components;

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            alert("please select valid location");
            this.service_form_additional.controls["locationAddress"].reset();
            return false;
          } else {
            //set latitude, longitude and zoom
            this.latitude = place.geometry.location.lat();
            this.longitude = place.geometry.location.lng();
            this.zoom = 12;

            console.log("location: ", this.latitude, this.longitude);
            this.setCurrentPosition();
          }
        });
      });
    });
  }

  invalid() {
    console.log("invalid location");
  }

  setCurrentPosition() {
    this.geoPoint = new firebase.firestore.GeoPoint(
      this.latitude,
      this.longitude
    );
    console.log(this.geoPoint);
  }

  // blobToFile(theBlob: Blob) {
  //   var b: any = theBlob;
  //   //A Blob() is almost a File() - it's just missing the two properties below which we will add
  //   b.lastModifiedDate = new Date();
  //   //Cast to a File() type
  //   return <File>theBlob;
  // }

  updateSpaceImage(event) {
    this.pic_loader = true;
    var that = this;
    new ImageCompressor(event.target.files[0], {
      quality: 0.6,
      success(result) {
        var image = <File>result;
        that.store.storage
          .ref()
          .child("user")
          .child(that.userId)
          .child(that.listingId)
          .child("image.jpg")
          .put(image)
          .then(uploadSnap => {
            uploadSnap.ref.getDownloadURL().then(downloadURL => {
              that.listing_event_image_url = downloadURL;
              that.pic_loader = false;
            });
          });
      },
      error(e) {
        console.log(e.message);
      }
    });
  }

  addServiceBasic() {
    if (this.service_form_basic.valid) {
      // create a new id for the listing
      this.listingId = this.afs.createId();

      // get the firestore doc
      const listingDoc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.userId + "/listing/" + this.listingId
      );

      listingDoc
        .set(
          {
            title: this.service_form_basic.controls["title"].value,
            description: this.service_form_basic.controls["description"].value,
            policy: this.service_form_basic.controls["policy"].value,
            listingType: this.listingType,
            currency: this.service_form_basic.controls["currency"].value,
            userId: this.userId
          },
          { merge: true }
        )
        .then(res => {
          listingDoc.snapshotChanges().subscribe(data => {
            console.log(data.payload.data());
          });
          this.loadGoogleMaps();
          this.step = "additional";
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      Object.keys(this.service_form_basic.controls).forEach(i =>
        this.service_form_basic.controls[i].markAsTouched()
      );
    }
  }

  addServiceAdditional() {
    if (this.service_form_additional.valid) {
      // get the firestore doc
      const listingDoc: AngularFirestoreDocument = this.afs.doc(
        "user/" + this.userId + "/listing/" + this.listingId
      );

      var state = "";
      var locationBrokenAddress = this.locationBrokenAddess_temp;

      var l = [];

      if (locationBrokenAddress.length > 1) {
        for (var i = 0; i < locationBrokenAddress.length; i++) {
          if (locationBrokenAddress[i].types[0] === "locality") {
            l.push(locationBrokenAddress[i].long_name);
          } else if (
            locationBrokenAddress[i].types[0] === "administrative_area_level_1"
          ) {
            l.push(locationBrokenAddress[i].long_name);
          } else if (locationBrokenAddress[i].types[0] === "country") {
            l.push(locationBrokenAddress[i].long_name);
          }
        }
      }

      this.service_form_additional.controls["locationBrokenAddress"].patchValue(
        l
      );

      for (var i = 0; i < locationBrokenAddress.length; i++) {
        if (
          locationBrokenAddress[i].types[0] === "administrative_area_level_1"
        ) {
          state = locationBrokenAddress[i].long_name;
        }
      }

      var st, ci;
      for (var i = 0; i < locationBrokenAddress.length; i++) {
        if (locationBrokenAddress[i].types[0] === "locality") {
          ci = locationBrokenAddress[i].long_name;
        } else if (
          locationBrokenAddress[i].types[0] === "administrative_area_level_1"
        ) {
          st = locationBrokenAddress[i].long_name;
        }
      }
      var short_add = ci + ", " + st;

      // converting startDate to timestamp
      var s = new Date().toDateString();
      var startDate = moment(
        s +
          " " +
          this.service_form_additional.controls["startDate"].value.toString() +
          ":00"
      ).toDate();

      // converting endDate to timestamp
      var e = new Date().toDateString();
      var endDate = moment(
        e +
          " " +
          this.service_form_additional.controls["endDate"].value.toString() +
          ":00"
      ).toDate();

      listingDoc
        .set(
          {
            service: this.service_form_additional.controls["service"].value,
            dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
            endDate: firebase.firestore.Timestamp.fromDate(endDate),
            geoPoint: this.geoPoint,
            isCanceled: false,
            isDraft: false,
            isLive: true,
            listingImageUrl: this.listing_event_image_url,
            locationAddress: this.service_form_additional.controls[
              "locationAddress"
            ].value,
            locationBrokenAddress: this.service_form_additional.controls[
              "locationBrokenAddress"
            ].value,
            locationShortAddress: short_add,
            minHour: +this.service_form_additional.controls["minHour"].value,
            startDate: firebase.firestore.Timestamp.fromDate(startDate),
            state: state,
            userId: this.userId,
            perHourPrice: parseFloat(
              this.service_form_additional.controls["perHourPrice"].value
            )
          },
          {
            merge: true
          }
        )
        .then(data => {
          listingDoc.snapshotChanges().subscribe(data => {
            console.log(data.payload.data());
            var id = data.payload.id;
            this.router.navigate(["listing/spaces-and-services", id]);
          });
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      Object.keys(this.service_form_additional.controls).forEach(i =>
        this.service_form_additional.controls[i].markAsTouched()
      );
    }
  }
}
