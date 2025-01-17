import { Routes } from '@angular/router';
import { PedigreesComponent } from './pedigrees/pedigrees.component';
import { MyPedigreesComponent } from './my-pedigrees/my-pedigrees.component';

export const PEDIGREE_ROUTES: Routes = [
  { path: '', component: PedigreesComponent },
  { path: 'my-pedigrees/:id', component: MyPedigreesComponent },
  { path: '**', redirectTo: '' },
];
