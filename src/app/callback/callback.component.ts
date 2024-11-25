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
      console.log('trxef to verify:', this.reference);
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
        if (response?.status && response?.data?.status === 'success') {
          this.paymentStatus = 'success';  // Explicitly set payment status to success
          console.log('Payment details:', response.data);

          // Assign payment details from the response
          this.paymentDetails = {
            amount: response.data.amount,  // Amount from response
            currency: response.data.currency,  // Currency from response
            gatewayResponse: response.data.gateway_response,  // Response message
            paidAt: response.data.paid_at,  // Payment date and time
            cardType: response.data.channel || 'N/A',  // Card type (or use channel as fallback)
            customerEmail: response.data.email || 'N/A'  // Customer's email, add to response if needed
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
