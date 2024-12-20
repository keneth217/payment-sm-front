import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private initializeUrl = 'https://3624-105-161-1-132.ngrok-free.app/api/paystack/initialize';  // For initializing payment
  private checkStatusUrl = 'http://localhost:8080/api/paystack/verify-transaction';  // Correct endpoint for checking payment status

  constructor(private http: HttpClient) {}

  // Method to initiate payment
  payNow(email: string, amount: string): Observable<PaymentResponse> {
    const payload = { email, amount }; // Combine email and amount into a single object.....
    return this.http.post<PaymentResponse>(this.initializeUrl, payload).pipe(
      catchError((error) => {
        console.error('Error in PaymentService:', error);
        return throwError(() => new Error(error.message || 'Server Error'));
      })
    );
  }


  checkPaymentStatus(reference: string): Observable<any> {
    const url = `${this.checkStatusUrl}/${reference}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.get<any>(url, { headers });  // Return a single object, not an array
  }





}
