import { Component } from '@angular/core';
import {AngularToastifyModule, ToastService} from "angular-toastify";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterOutlet} from "@angular/router";
import {PaymentResponse, PaymentService} from "../service/payment.service";

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
  styleUrl: './payment-form.component.css'
})
export class PaymentFormComponent {
  isPaying: boolean = false;
  payForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: PaymentService,
    private toast: ToastService
  ) {
    this.payForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      amount: ['', [Validators.required, Validators.pattern('^[0-9]+(\\.[0-9]{1,2})?$')]]
    });
  }
  payNow() {
    if (this.payForm.valid) {
      const paymentData = this.payForm.value;
      console.log(paymentData);
      this.isPaying = true;

      this.service.payNow(this.payForm.value.email, this.payForm.value.amount).subscribe({
        next: (response: PaymentResponse) => {
          if (response.status) {
            this.toast.success(response.message + ": You are being redirected to payment page");
console.log(response)
            // Redirect to Paystack payment page

localStorage.setItem('reference',response.data.reference)
            // Optionally, you can store some data here in case you need it after returning from Paystack
            sessionStorage.setItem('paymentReference', response.data.reference);

// Redirect after a delay of two minutes (120,000 milliseconds)
            setTimeout(() => {
              window.location.href = response.data.authorization_url;
            }, 120000); // 120,000 milliseconds = 2 minutes
          } else {
            this.toast.error('Payment initialization failed!');
          }
        },
        error: (error) => {
          console.error('Error initializing payment:', error);
          this.toast.error(error.error?.errorMessage || 'Something went wrong!');
        },
        complete: () => {
          this.isPaying = false;
        }
      });
    } else {
      this.toast.warn('Please fill in all required fields!');
    }
  }

}
