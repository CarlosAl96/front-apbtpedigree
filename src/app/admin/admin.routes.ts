import { Routes } from '@angular/router';
import { UsersComponent } from './users/users.component';

export const ADMIN_ROUTES: Routes = [
  // { path: 'calendario', component: CalendarComponent },
  { path: 'usuarios', component: UsersComponent },
  // { path: 'pagos', component: InvoicesComponent },
  // { path: 'productos', component: ProductsComponent },
  // { path: 'contratos', component: ContractsComponent },
  // { path: 'proximos-pagos', component: NextInvoicesComponent },
  { path: '**', redirectTo: 'usuarios' },
];
