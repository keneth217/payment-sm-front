import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
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
  private checkStatusUrl = 'https://3624-105-161-1-132.ngrok-free.app/api/paystack/verify-transaction';  // Correct endpoint for checking payment status

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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', // Set Content-Type header
    });

    return this.http.get<any>(`${this.checkStatusUrl}/${reference}`, { headers }).pipe(
      map(response => {
        // Assuming Paystack response contains a 'data' property for the transaction status
        if (response.status === 'success' && response.data) {
          return response.data;  // You can return the actual data from Paystack's response
        } else {
          throw new Error('Payment verification failed');
        }
      }),
      catchError((error: any) => {
        console.error('Error checking payment status:', error);  // Log full error object
        const errorMessage = error?.error?.message || 'Failed to verify payment status';  // Check if error is available
        return throwError(() => new Error(errorMessage));  // Return the error message for the component
      })
    );
  }







}
