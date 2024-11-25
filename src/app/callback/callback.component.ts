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
      this.reference = params['reference'];
      console.log(this.reference+ "reference to verify....................................");

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
        console.log(response);

        // Check if response status is true and payment status is 'success'
        if (response?.status && response.data?.status === 'success') {
          const myStatus=response.data?.status
          console.log(myStatus)
          this.paymentStatus = response.data?.status
          this.paymentStatus = 'success';
          console.log("payments details..................."+this.paymentDetails)
          this.paymentDetails = {
            amount: response.data.amount,
            currency: response.data.currency,
            gatewayResponse: response.data.gateway_response,
            paidAt: response.data.paid_at,
            cardType: response.data.authorization.card_type,
            customerEmail: response.data.customer.email
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
