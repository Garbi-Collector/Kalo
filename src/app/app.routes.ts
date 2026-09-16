import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ResultadoComponent } from './pages/resultado/resultado.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'resultado', component: ResultadoComponent },
  { path: '**', redirectTo: '' }
];
