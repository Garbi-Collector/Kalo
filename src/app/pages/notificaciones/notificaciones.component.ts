import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LocalNotifications } from '@capacitor/local-notifications';

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

  constructor(private router: Router) {}

  async activarNotificaciones(): Promise<void> {
    this.cargando = true;
    try {
      const permiso = await LocalNotifications.requestPermissions();

      if (permiso.display === 'granted') {
        this.estado = 'concedido';
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 1,
              title: '¡Gracias! 🥕',
              body: 'Gracias por activar las notificaciones. Te vamos a avisar cuando sea momento de registrar tus comidas y tu actividad.',
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
    // Cuando exista la siguiente pantalla, cambiamos esta ruta
    this.router.navigate(['/']);
  }

  volver(): void {
    this.router.navigate(['/habitos']);
  }
}
