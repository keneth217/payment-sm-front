import { Component } from '@angular/core';
import { AngularToastifyModule, ToastService } from "angular-toastify";
import { NgIf } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterOutlet } from "@angular/router";
import { PaymentResponse, PaymentService } from "../service/payment.service";

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    AngularToastifyModule,
    NgIf,
    ReactiveFormsModule,
    RouterOutlet
  ],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.css']
})
export class PaymentFormComponent {
  isPaying: boolean = false;
  payForm!: FormGroup;
  message:string=''

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: PaymentService,
    private toast: ToastService
  ) {
    // Initialize the payment form with validators
    this.payForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]]
    });
  }

  // Method to initiate payment
  payNow() {
    if (this.payForm.valid) {
      const paymentData = this.payForm.value;
      console.log(paymentData);

      this.isPaying = true; // Show loading spinner
      this.message = ''; // Clear any previous message
      // Call the service to initialize payment
      this.service.payNow(paymentData.email, paymentData.amount).subscribe({
        next: (response: PaymentResponse) => {
          if (response.status) {

           this.message='wait for a few minutes to be directed to payment page'
            this.toast.success(response.message + ": You are being redirected to the payment page");
            console.log(response);

            // Store the reference locally (sessionStorage is safer in this case for temporary storage)
            localStorage.setItem('reference', response.data.reference);
            sessionStorage.setItem('paymentReference', response.data.reference);


              this.message=''
              window.location.href = response.data.authorization_url;

          } else {
            this.toast.error('Payment initialization failed!');
          }
        },
        error: (error) => {
          console.error('Error initializing payment:', error);
          this.toast.error(error.error?.errorMessage || 'Something went wrong!');
        },
        complete: () => {
          this.isPaying = false; // Hide loading spinner after completion
        }
      });
    } else {
      this.toast.warn('Please fill in all required fields!');
    }
  }
}
