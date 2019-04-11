import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpResponse
} from "@angular/common/http";
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class InterceptorService implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request to add the new header.
    // const token = localStorage.getItem('accessToken');
    // if (token) {
    //   req = req.clone({ headers: req.headers.set('authorization', 'Bearer ' + token) });
    // }

    return next.handle(req).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // code here
          }
        },
        (err: any) => {
          // error handling
        }
      )
    );
  }
}
