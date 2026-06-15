import { Routes } from '@angular/router';
import { PedigreesComponent } from './pedigrees/pedigrees.component';
import { MyPedigreesComponent } from './my-pedigrees/my-pedigrees.component';
import { PedigreeClaimsComponent } from './pedigree-claims/pedigree-claims.component';

export const PEDIGREE_ROUTES: Routes = [
  { path: '', component: PedigreesComponent },
  { path: 'claims', component: PedigreeClaimsComponent },
  { path: 'new', component: MyPedigreesComponent },
  { path: 'view/:id', component: MyPedigreesComponent },
  { path: 'my-pedigrees/:id', component: MyPedigreesComponent },
  { path: '**', redirectTo: '' },
];
