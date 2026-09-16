import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImcService } from '../../services/imc.service';

interface OpcionCalorica {
  id: string;
  etiqueta: string;
  detalle: string;
  valor: number | null; // null = personalizado
}

@Component({
  selector: 'app-habitos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitos.component.html',
  styleUrl: './habitos.component.css'
})
export class HabitosComponent {
  opcionesComidas: OpcionCalorica[] = [
    { id: 'comida-3-liviano', etiqueta: '3 comidas al día, liviano', detalle: 'aprox. 1500 kcal', valor: 1500 },
    { id: 'comida-3-completo', etiqueta: '3 comidas al día, completo', detalle: 'aprox. 2200 kcal', valor: 2200 },
    { id: 'comida-4-liviano', etiqueta: '4 comidas al día, liviano', detalle: 'aprox. 1800 kcal', valor: 1800 },
    { id: 'comida-4-pesado', etiqueta: '4 comidas al día, pesado', detalle: 'aprox. 2800 kcal', valor: 2800 },
    { id: 'comida-personalizado', etiqueta: 'Personalizado', detalle: 'Ingresá tu propio valor', valor: null }
  ];

  opcionesActividad: OpcionCalorica[] = [
    { id: 'actividad-sedentario', etiqueta: 'Sedentario', detalle: 'aprox. 1800 kcal', valor: 1800 },
    { id: 'actividad-poco', etiqueta: 'Me muevo poco', detalle: 'aprox. 2000 kcal', valor: 2000 },
    { id: 'actividad-movido', etiqueta: 'Movido', detalle: 'aprox. 2400 kcal', valor: 2400 },
    { id: 'actividad-personalizado', etiqueta: 'Personalizado', detalle: 'Ingresá tu propio valor', valor: null }
  ];

  comidaSeleccionada = '';
  actividadSeleccionada = '';
  caloriasComidaPersonalizada: number | null = null;
  caloriasActividadPersonalizada: number | null = null;
  error = '';

  constructor(private imcService: ImcService, private router: Router) {}

  seleccionarComida(id: string): void {
    this.comidaSeleccionada = id;
    this.error = '';
  }

  seleccionarActividad(id: string): void {
    this.actividadSeleccionada = id;
    this.error = '';
  }

  get esComidaPersonalizada(): boolean {
    return this.comidaSeleccionada === 'comida-personalizado';
  }

  get esActividadPersonalizada(): boolean {
    return this.actividadSeleccionada === 'actividad-personalizado';
  }

  continuar(): void {
    this.error = '';

    if (!this.comidaSeleccionada || !this.actividadSeleccionada) {
      this.error = 'Elegí una opción en cada sección para continuar.';
      return;
    }

    let caloriasConsumidas: number | null;
    if (this.esComidaPersonalizada) {
      caloriasConsumidas = this.caloriasComidaPersonalizada;
      if (!caloriasConsumidas || caloriasConsumidas < 500 || caloriasConsumidas > 6000) {
        this.error = 'Ingresá un valor de calorías consumidas válido (entre 500 y 6000).';
        return;
      }
    } else {
      caloriasConsumidas = this.opcionesComidas.find(o => o.id === this.comidaSeleccionada)!.valor;
    }

    let caloriasQuemadas: number | null;
    if (this.esActividadPersonalizada) {
      caloriasQuemadas = this.caloriasActividadPersonalizada;
      if (!caloriasQuemadas || caloriasQuemadas < 800 || caloriasQuemadas > 6000) {
        this.error = 'Ingresá un valor de calorías quemadas válido (entre 800 y 6000).';
        return;
      }
    } else {
      caloriasQuemadas = this.opcionesActividad.find(o => o.id === this.actividadSeleccionada)!.valor;
    }

    this.imcService.setHabitos(caloriasConsumidas!, caloriasQuemadas!);
    this.router.navigate(['/notificaciones']);
  }

  volver(): void {
    this.router.navigate(['/resultado']);
  }
}
