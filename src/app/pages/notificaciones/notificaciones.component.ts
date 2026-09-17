import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';
import {ImcService} from "../../services/imc.service";

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent {
  estado: 'inicial' | 'concedido' | 'denegado' | 'error' = 'inicial';
  cargando = false;

  constructor(private imcService: ImcService, private router: Router) {}

  async activarNotificaciones(): Promise<void> {
    this.cargando = true;
    try {
      const permiso = await LocalNotifications.requestPermissions();

      if (permiso.display === 'granted') {
        this.estado = 'concedido';
        this.imcService.setNotificacionesActivadas(true);
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 1,
              title: '¡Gracias!',
              body: 'Gracias por activar las notificaciones.',
              schedule: { at: new Date(Date.now() + 1000) }
            }
          ]
        });
      } else {
        this.estado = 'denegado';
      }
    } catch {
      this.estado = 'error';
    } finally {
      this.cargando = false;
    }
  }

  continuar(): void {
    this.router.navigate(['/home']);
  }

  volver(): void {
    this.router.navigate(['/habitos']);
  }
}
