import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../service/payment.service';
import { CommonModule } from "@angular/common";

interface PaymentDetails {
  amount: number;
  currency: string;
  gatewayResponse: string;
  paidAt: string;
  cardType: string;
  customerEmail: string;
}

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent {
  reference: string = '';
  isLoading: boolean = true;
  paymentStatus: string | null = null;  // Will hold the payment status ('success' or 'fail')
  paymentDetails: PaymentDetails | null = null;  // To store details about the payment (amount, status, etc.)

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Get reference from URL
    this.route.queryParams.subscribe(params => {
      this.reference = params['reference'] || params['trxref'];
      console.log('Reference to verify:', this.reference);

      if (this.reference) {
        this.verifyPaymentStatus(this.reference); // Correct method signature
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
        console.log('Payment Status Response:', response);

        // Check if response status is true and payment status is 'success'
        if (response?.status && response.data?.status === 'success') {
          this.paymentStatus = 'success';  // Explicitly set payment status to success
          console.log('Payment details:', response.data);

          // Assign payment details if response structure is correct
          this.paymentDetails = {
            amount: response.data.amount,
            currency: response.data.currency,
            gatewayResponse: response.data.gateway_response,
            paidAt: response.data.paid_at,
            cardType: response.data.authorization?.card_type || 'N/A', // Safely access card_type
            customerEmail: response.data.customer?.email || 'N/A' // Safely access customer email
          };
        } else {
          this.paymentStatus = 'fail';
          this.paymentDetails = null; // Clear payment details if not successful
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error during payment status check:', error);
        this.paymentStatus = 'fail';
        this.paymentDetails = null; // Clear payment details on error
        this.isLoading = false;
      },
    });
  }
}
