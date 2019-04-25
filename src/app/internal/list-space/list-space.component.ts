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
import { ActivatedRoute, Router } from "@angular/router";
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
  public space_form_basic: FormGroup;
  public space_form_additional: FormGroup;
  public zoom: number;
  pic_loader = false;
  @Input() userId: any;
  step = "basic";
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
    private atp: AmazingTimePickerService,
    private router: Router
  ) {
    this.space_form_basic = this.fb.group({
      title: [""],
      description: [""],
      policy: [""],
      currency: [""]
    });

    this.space_form_additional = this.fb.group({
      amenitiesOrRules: [""],
      cleaningFee: [""],
      damageDeposit: [""],
      dateCreated: [""],
      endDate: [""],
      geoPoint: [""],
      isCanceled: [""],
      capacity: [""],
      sQFT: [""],
      isDraft: [""],
      isLive: [""],
      listingImageUrl: [""],
      locationAddress: [""],
      locationBrokenAddress: [""],
      locationName: [""],
      locationShortAddress: [""],
      minDay: [""],
      minHour: [""],
      perDayPrice: [""],
      startDate: [""],
      state: [""],
      perHourPrice: [""]
    });
  }

  ngOnInit() {
    this.space_form_basic.controls["policy"].patchValue("no");
    this.space_form_basic.controls["currency"].patchValue("cad");
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
  }

  loadGoogleMaps() {
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

          this.space_form_additional.controls["locationAddress"].patchValue(
            place.formatted_address
          );

          this.locationBrokenAddess_temp = place.address_components;

          console.log(this.locationBrokenAddess_temp);

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
  onItemDeselect(item: any) {
    var index = this.selectedItems.indexOf(item.value);
    this.selectedItems.splice(index, 1);
  }
  //end

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

  addSpaceBasic() {
    this.listingId = this.afs.createId();
    // get the firestore doc
    const listingDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.userId + "/listing/" + this.listingId
    );

    listingDoc
      .set({
        title: this.space_form_basic.controls["title"].value,
        currency: this.space_form_basic.controls["currency"].value,
        userId: this.userId,
        listingType: this.listingType,
        description: this.space_form_basic.controls["description"].value,
        policy: this.space_form_basic.controls["policy"].value
      })
      .then(res => {
        listingDoc.snapshotChanges().subscribe(data => {
          console.log(data.payload.data());
        });
        this.step = "additional";
        this.loadGoogleMaps();
      })
      .catch(err => {
        console.log(err);
      });
  }

  addSpaceAdditional() {
    // get the firestore doc
    const listingDoc: AngularFirestoreDocument = this.afs.doc(
      "user/" + this.userId + "/listing/" + this.listingId
    );

    var state = "";
    var locationBrokenAddress = this.locationBrokenAddess_temp;
    console.log(this.locationBrokenAddess_temp);

    var l = [];

    for (var i = 0; i < locationBrokenAddress.length; i++) {
      l.push(locationBrokenAddress[i].long_name);
    }

    this.space_form_additional.controls["locationBrokenAddress"].patchValue(l);

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
      s +
        " " +
        this.space_form_additional.controls["startDate"].value.toString() +
        ":00"
    ).toDate();

    // converting endDate to timestamp
    var e = new Date().toDateString();
    var endDate = moment(
      e +
        " " +
        this.space_form_additional.controls["endDate"].value.toString() +
        ":00"
    ).toDate();

    listingDoc
      .set(
        {
          amenitiesOrRules: this.selectedItems,
          capacity: +this.space_form_additional.controls["capacity"].value,
          cleaningFee: parseFloat(
            this.space_form_additional.controls["cleaningFee"].value
          ),
          damageDeposit: parseFloat(
            this.space_form_additional.controls["damageDeposit"].value
          ),
          dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
          endDate: endDate,
          geoPoint: this.geoPoint,
          isCanceled: false,
          isDraft: false,
          isLive: true,
          listingImageUrl: this.listing_event_image_url,
          locationAddress: this.space_form_additional.controls[
            "locationAddress"
          ].value,
          locationBrokenAddress: this.space_form_additional.controls[
            "locationBrokenAddress"
          ].value,
          locationName: this.space_form_additional.controls["locationName"]
            .value,
          locationShortAddress: short_add,
          minDay: +this.space_form_additional.controls["minDay"].value,
          minHour: +this.space_form_additional.controls["minHour"].value,
          perDayPrice: parseFloat(
            this.space_form_additional.controls["perDayPrice"].value
          ),
          sQFT: +this.space_form_additional.controls["sQFT"].value,
          startDate: startDate,
          state: state,
          perHourPrice: parseFloat(
            this.space_form_additional.controls["perHourPrice"].value
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
  }

  updateSpaceImage(event) {
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
