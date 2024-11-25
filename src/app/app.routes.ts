import { Routes } from '@angular/router';
import {PaymentSuccessComponent} from "./payment-success/payment-success.component";
import {CallbackComponent} from "./callback/callback.component";
import {PaymentFormComponent} from "./payment-form/payment-form.component";
import {PaymentfailComponent} from "./paymentfail/paymentfail.component";

export const routes: Routes = [

  { path: "", redirectTo: "pay", pathMatch: "full" },
  { path: 'pay', title: 'Pay Page', component: PaymentFormComponent },
  {path:'success',component:PaymentSuccessComponent},
  {path:'fail',component:PaymentfailComponent},
  {path:'payment/callback',component:CallbackComponent}
];
