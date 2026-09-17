import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ImcService } from '../services/imc.service';

// Se usa en la ruta raíz ('' -> InicioComponent): si ya tiene los datos, lo manda directo a /home
export const redirigirSiYaTieneDatosGuard: CanActivateFn = () => {
  const imcService = inject(ImcService);
  const router = inject(Router);

  if (imcService.tieneOnboardingCompleto()) {
    return router.parseUrl('/home');
  }
  return true;
};

// Se usa en rutas que requieren tener el onboarding completo (ej: /home, /tracker)
export const requiereOnboardingGuard: CanActivateFn = () => {
  const imcService = inject(ImcService);
  const router = inject(Router);

  if (imcService.tieneOnboardingCompleto()) {
    return true;
  }
  return router.parseUrl('/');
};
