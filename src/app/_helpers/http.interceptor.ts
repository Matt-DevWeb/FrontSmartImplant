import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpInterceptorFn,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { Observable } from 'rxjs';

export const HttpRequestInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  req = req.clone({
    withCredentials: true,
  });

  return next(req);
};

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
