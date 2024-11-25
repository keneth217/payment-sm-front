import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../service/payment.service';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  standalone: true,
  imports:[CommonModule],
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent {
  reference: string | null = null;
  isLoading: boolean = true;
  paymentStatus: string | null = null;  // Will hold the payment status ('success' or 'fail')

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Get reference from URL
    this.route.queryParams.subscribe(params => {
      this.reference = params['reference'];

      if (this.reference) {
        this.verifyPaymentStatus(this.reference);
      } else {
        // Handle missing reference, show error message
        this.paymentStatus = 'fail';
        this.isLoading = false;
      }
    });
  }

  verifyPaymentStatus(reference: string): void {
    this.isLoading = true;
    this.paymentService.checkPaymentStatus(reference).subscribe({
      next: (response) => {
        console.log(response);
        // Ensure 'response' structure matches your backend
        if (response && response.status === 'success') {
          this.paymentStatus = 'success';
        } else {
          this.paymentStatus = 'fail';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error during payment status check:', error);
        this.paymentStatus = 'fail';
        this.isLoading = false;
      },
    });
  }
}
