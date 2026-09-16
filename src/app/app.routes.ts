import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ResultadoComponent } from './pages/resultado/resultado.component';
import { HabitosComponent } from './pages/habitos/habitos.component';
import { NotificacionesComponent } from './pages/notificaciones/notificaciones.component';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'resultado', component: ResultadoComponent },
  { path: 'habitos', component: HabitosComponent },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: '**', redirectTo: '' }
];
