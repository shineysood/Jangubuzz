import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  Input
} from "@angular/core";
import * as moment from "moment";
import { FormGroup, FormBuilder } from "@angular/forms";
import { google } from "@google/maps";
import { MapsAPILoader } from "@agm/core";
import { ActivatedRoute } from "@angular/router";
import * as $ from "jquery";
import { AngularFireAuth } from "@angular/fire/auth";
import * as firebase from "firebase/app";
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireStorage } from "@angular/fire/storage";
import {
  AngularFirestore,
  AngularFirestoreDocument
} from "@angular/fire/firestore";
import { AmazingTimePickerService } from "amazing-time-picker";

declare var google: any;

@Component({
  selector: "app-list-space",
  templateUrl: "./list-space.component.html",
  styleUrls: ["./list-space.component.css"]
})
export class ListSpaceComponent implements OnInit {
  expanded = false;
  ar = [];
  geoPoint: any;
  amenities;
  public latitude: number;
  public longitude: number;
  public space_form: FormGroup;
  public experience_form: FormGroup;
  public zoom: number;
  pic_loader = false;
  @Input() userId: any;
  listingId;
  listing_event_image_url;
  @Input() listingType: any;
  locationBrokenAddess_temp;
  temp;

  @ViewChild("search")
  public searchElementRef: ElementRef;

  // for multiselect dropdown
  dropdownList: Array<any>;
  selectedItems = [];
  dropdownSettings = {};

  constructor(
    private route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public afd: AngularFireDatabase,
    public store: AngularFireStorage,
    private atp: AmazingTimePickerService
  ) {
    this.space_form = this.fb.group({
      amenitiesOrRules: [""],
      capacity: [""],
      cleaningFee: [""],
      currency: [""],
      damageDeposit: [""],
      dateCreated: [""],
      description: [""],
      endDate: [""],
      geoPoint: [""],
      isCanceled: [""],
      isDraft: [""],
      isLive: [""],
      listingImageUrl: [""],
      listingType: [""],
      locationAddress: [""],
      locationBrokenAddress: [""],
      locationName: [""],
      locationShortAddress: [""],
      minDay: [""],
      minHour: [""],
      perDayPrice: [""],
      policy: [""],
      sQFT: [""],
      startDate: [""],
      state: [""],
      title: [""],
      userId: [""],
      perHourPrice: [""]
    });
  }

  ngOnInit() {
    this.space_form.controls["policy"].patchValue("no");
    this.afs
      .collection("amenities")
      .snapshotChanges()
      .subscribe(data => {
        this.dropdownList = [];
        data.forEach((item, i) => {
          var obj = {
            id: i,
            value: data[i].payload.doc.id
          };
          this.dropdownList.push(obj);
        });
        console.log(this.dropdownList);
        setTimeout(() => {}, 2000);

        // settings for multiselect dropdown
        this.dropdownSettings = {
          singleSelection: false,
          // idField: "id",
          textField: "value",
          selectAllText: "Select All",
          unSelectAllText: "UnSelect All",
          itemsShowLimit: 6,
          allowSearchFilter: false
        };
      });

    this.route.params.subscribe(data => {
      this.userId = data.userId;
      this.listingType = data.listingType;
    });

    //set google maps defaults
    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

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

          this.space_form.controls["locationAddress"].patchValue(
            place.formatted_address
          );

          this.locationBrokenAddess_temp = place.address_components;

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
  }

  // methods for dropdown list
  onItemSelect(item: any) {
    this.selectedItems.push(item.value);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  //end

  open() {
    const amazingTimePicker = this.atp.open();
    amazingTimePicker.afterClose().subscribe(time => {
      console.log(time);
    });
  }

  showCheckboxes() {
    console.log(this.ar);
    var checkboxes = document.getElementById("checkboxes");
    if (!this.expanded) {
      checkboxes.style.display = "block";
      this.expanded = true;
    } else {
      checkboxes.style.display = "none";
      this.expanded = false;
    }
  }

  setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
    this.geoPoint = new firebase.firestore.GeoPoint(
      this.latitude,
      this.longitude
    );
    console.log(this.geoPoint);
  }

  addSpace() {
    // get the firestore doc
    const listingDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.userId + "/listing/" + this.listingId
    );

    var state = "";
    var locationBrokenAddress = this.locationBrokenAddess_temp;

    var l = [];

    for (var i = 0; i < locationBrokenAddress.length; i++) {
      l.push(locationBrokenAddress[i].long_name);
    }

    this.space_form.controls["locationBrokenAddress"].patchValue(l);

    for (var i = 0; i < locationBrokenAddress.length; i++) {
      if (locationBrokenAddress[i].types[0] === "administrative_area_level_1") {
        state = locationBrokenAddress[i].long_name;
      }
    }

    var st, ci;
    for (var i = 0; i < locationBrokenAddress.length; i++) {
      if (locationBrokenAddress[i].types[0] === "administrative_area_level_2") {
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
      s + " " + this.space_form.controls["startDate"].value.toString() + ":00"
    ).toDate();

    // converting endDate to timestamp
    var e = new Date().toDateString();
    var endDate = moment(
      e + " " + this.space_form.controls["endDate"].value.toString() + ":00"
    ).toDate();

    listingDoc
      .set(
        {
          amenitiesOrRules: this.selectedItems,
          capacity: +this.space_form.controls["capacity"].value,
          cleaningFee: parseFloat(
            this.space_form.controls["cleaningFee"].value
          ),
          currency: this.space_form.controls["currency"].value,
          damageDeposit: parseFloat(
            this.space_form.controls["damageDeposit"].value
          ),
          dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          description: this.space_form.controls["description"].value,
          endDate: endDate,
          geoPoint: this.geoPoint,
          isCanceled: false,
          isDraft: false,
          isLive: true,
          listingImageUrl: this.listing_event_image_url,
          listingType: this.listingType,
          locationAddress: this.space_form.controls["locationAddress"].value,
          locationBrokenAddress: this.space_form.controls[
            "locationBrokenAddress"
          ].value,
          locationName: this.space_form.controls["locationName"].value,
          locationShortAddress: short_add,
          minDay: +this.space_form.controls["minDay"].value,
          minHour: +this.space_form.controls["minHour"].value,
          perDayPrice: parseFloat(
            this.space_form.controls["perDayPrice"].value
          ),
          policy: this.space_form.controls["policy"].value,
          sQFT: +this.space_form.controls["sQFT"].value,
          startDate: startDate,
          state: state,
          title: this.space_form.controls["title"].value,
          userId: this.userId,
          perHourPrice: parseFloat(
            this.space_form.controls["perHourPrice"].value
          )
        },
        {
          merge: true
        }
      )
      .then(data => {
        listingDoc.snapshotChanges().subscribe(data => {
          console.log(data.payload.data());
        });
      });
  }

  updateSpaceImage(event) {
    // create a new id for the listing
    this.listingId = this.afs.createId();
    this.pic_loader = true;
    this.store.storage
      .ref()
      .child("user")
      .child(this.userId)
      .child(this.listingId)
      .child("image.jpg")
      .put(event.target.files[0])
      .then(uploadSnap => {
        uploadSnap.ref.getDownloadURL().then(downloadURL => {
          this.listing_event_image_url = downloadURL;
          this.pic_loader = false;
          console.log(this.listing_event_image_url, this.listingId);
        });
      });
  }

  set() {
    var s = new Date().toDateString();
    var startDate = moment(s + " " + "23:00:00");
    console.log(startDate.toDate());
  }
}
