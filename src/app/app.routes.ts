import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ResultadoComponent } from './pages/resultado/resultado.component';
import { HabitosComponent } from './pages/habitos/habitos.component';
import { NotificacionesComponent } from './pages/notificaciones/notificaciones.component';
import { HomeComponent } from './pages/home/home.component';
import { TrackerComponent } from './pages/tracker/tracker.component';
import { redirigirSiYaTieneDatosGuard, requiereOnboardingGuard } from './guards/onboarding.guard';

export const routes: Routes = [
  { path: '', component: InicioComponent, canActivate: [redirigirSiYaTieneDatosGuard] },
  { path: 'resultado', component: ResultadoComponent },
  { path: 'habitos', component: HabitosComponent },
  { path: 'notificaciones', component: NotificacionesComponent },
  { path: 'home', component: HomeComponent, canActivate: [requiereOnboardingGuard] },
  { path: 'tracker', component: TrackerComponent, canActivate: [requiereOnboardingGuard] },
  { path: '**', redirectTo: '' }
];
