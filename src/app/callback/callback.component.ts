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
  paymentStatus: string | null = null;
  paymentDetails: PaymentDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    // Get reference from URL query params
    this.route.queryParams.subscribe(params => {
      this.reference = params['reference'] || params['trxref'];
      console.log('Reference to verify:', this.reference);

      if (this.reference) {
        this.verifyPaymentStatus(this.reference); // Call to check the payment status
      } else {
        this.paymentStatus = 'fail';  // If no reference, show failure
        this.isLoading = false; // Stop loading spinner
      }
    });
  }

// Method to verify the payment status
  verifyPaymentStatus(reference: string): void {
    this.isLoading = true;  // Start loading spinner

    this.paymentService.checkPaymentStatus(reference).subscribe({
      next: (response) => {
        console.log('Payment Status Response:', response);

        // Handle both text and JSON responses
        if (typeof response === 'string') {
          // If the response is plain text, try to check for success in the text
          if (response.includes('success')) {
            this.paymentStatus = 'success';  // Set success status
            console.log('Payment details:', response);

          } else {
            this.paymentStatus = 'fail'; // In case of failure in plain text
            this.paymentDetails = null; // Clear payment details if fail
          }
        } else if (response) {
          // If the response is JSON and has the 'success' status
          this.paymentStatus = 'success';  // Set success status
          console.log('Payment details:', response);

          // Assign payment details from response

        } else {
          this.paymentStatus = 'fail'; // In case of failure
          this.paymentDetails = null; // Clear payment details if fail
        }

        this.isLoading = false; // Stop loading spinner
      },
      error: (error) => {
        console.error('Error during payment status check:', error);
        this.paymentStatus = 'fail';
        this.paymentDetails = null; // Clear payment details on error
        this.isLoading = false; // Stop loading spinner
      },
    });
  }

}
