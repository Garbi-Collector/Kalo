import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImcService, InfoDiaModal } from '../../services/imc.service';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { CalendarGridComponent } from '../../shared/calendar-grid/calendar-grid.component';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, BottomNavComponent, CalendarGridComponent],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css'
})
export class CalendarioComponent {
  fechaVisible = new Date();
  modalAbierto = false;
  infoDia: InfoDiaModal | null = null;
  fechaSeleccionada = '';

  private touchStartY = 0;

  constructor(private imcService: ImcService, private router: Router) {}

  get anio(): number { return this.fechaVisible.getFullYear(); }
  get mes(): number { return this.fechaVisible.getMonth(); }

  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const deltaY = event.changedTouches[0].clientY - this.touchStartY;
    const UMBRAL = 50;
    if (deltaY < -UMBRAL) this.mesAnterior();      // deslizó hacia arriba
    else if (deltaY > UMBRAL) this.mesSiguiente(); // deslizó hacia abajo
  }

  mesAnterior(): void {
    this.fechaVisible = new Date(this.anio, this.mes - 1, 1);
  }

  mesSiguiente(): void {
    this.fechaVisible = new Date(this.anio, this.mes + 1, 1);
  }

  onDiaClick(fecha: string): void {
    this.fechaSeleccionada = fecha;
    this.infoDia = this.imcService.obtenerInfoDia(fecha);
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  volver(): void {
    this.router.navigate(['/tracker']);
  }
}
