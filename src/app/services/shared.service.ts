import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class SharedService {
  users = [];
  constructor(private afs: AngularFirestore) {}

  getUserList() {
    this.afs
      .collection("user")
      .stateChanges(["added"])
      .subscribe(users => {
        users.forEach(item => {
          var d: any = item;
          var user = {
            id: d.payload.doc.id,
            name: d.payload.doc.data().name,
            imageUrl: d.payload.doc.data().profileImageUrl
          };
          this.users.push(user);
        });
      });
      return this.users;
  }

   getUser(uid) {
     var user = this.getUserList().filter((item, i) => {
      return item.id === uid;
    });
    return user[0];
  }

  
}
