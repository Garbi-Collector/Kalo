import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImcService } from '../../services/imc.service';

interface CeldaDia {
  fecha: string | null;
  numero: number | null;
  color: string;
  esHoy: boolean;
}

@Component({
  selector: 'app-calendar-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-grid.component.html',
  styleUrl: './calendar-grid.component.css'
})
export class CalendarGridComponent implements OnChanges {
  @Input({ required: true }) anio!: number;
  @Input({ required: true }) mes!: number; // 0-11
  @Input() interactivo = true;
  @Output() diaClick = new EventEmitter<string>();

  readonly diasSemana = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  celdas: CeldaDia[] = [];
  nombreMes = '';

  constructor(private imcService: ImcService) {}

  ngOnChanges(): void {
    this.generarGrilla();
  }

  private generarGrilla(): void {
    const primerDia = new Date(this.anio, this.mes, 1);
    const diasEnMes = new Date(this.anio, this.mes + 1, 0).getDate();
    const diaSemanaInicio = primerDia.getDay();

    this.nombreMes = primerDia.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

    const celdas: CeldaDia[] = [];
    for (let i = 0; i < diaSemanaInicio; i++) {
      celdas.push({ fecha: null, numero: null, color: '', esHoy: false });
    }
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fecha = `${this.anio}-${String(this.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const marca = this.imcService.obtenerMarcaDia(fecha);
      celdas.push({ fecha, numero: dia, color: marca.color, esHoy: marca.esHoy });
    }
    this.celdas = celdas;
  }

  onDiaClick(celda: CeldaDia): void {
    if (!this.interactivo || !celda.fecha) return;
    this.diaClick.emit(celda.fecha);
  }
}
