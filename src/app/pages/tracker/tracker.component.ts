import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImcService, RegistroDia, ResumenCalorico } from '../../services/imc.service';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { Router } from '@angular/router';
import { CalendarGridComponent } from '../../shared/calendar-grid/calendar-grid.component';


type ModalActivo = 'ninguno' | 'comida' | 'ejercicio' | 'perfil' | 'habitos';

interface OpcionCalorica {
  id: string;
  etiqueta: string;
  detalle: string;
  valor: number | null;
}

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, TopBarComponent, BottomNavComponent, CalendarGridComponent],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.css'
})
export class TrackerComponent implements OnInit {


  constructor(private imcService: ImcService, private router: Router) {}


  resumen: ResumenCalorico = {
    consumidoBase: 0, consumidoExtra: 0, consumidoTotal: 0,
    quemadoBase: 0, quemadoExtra: 0, quemadoTotal: 0, balance: 0
  };
  registros: RegistroDia[] = [];

  anioActual = new Date().getFullYear();
  mesActual = new Date().getMonth();

  modalHitoAbierto = false;
  hitoTipo: 'perdido' | 'ganado' | null = null;

  modalActivo: ModalActivo = 'ninguno';
  error = '';

  caloriasComidaInput: number | null = null;
  notaComidaInput = '';

  caloriasEjercicioInput: number | null = null;
  notaEjercicioInput = '';

  alturaInput: number | null = null;
  pesoInput: number | null = null;


  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.resumen = this.imcService.obtenerResumenCalorico();
    this.registros = this.imcService.obtenerRegistrosHoy();
  }

  abrirModal(modal: ModalActivo): void {
    this.error = '';
    if (modal === 'perfil') {
      const datos = this.imcService.obtenerDatos();
      this.alturaInput = datos?.altura ?? null;
      this.pesoInput = datos?.peso ?? null;
    }
    if (modal === 'habitos') {
      const habitos = this.imcService.obtenerHabitos();
      const opcionComida = this.opcionesComidas.find(o => o.valor === habitos?.caloriasConsumidas);
      const opcionActividad = this.opcionesActividad.find(o => o.valor === habitos?.caloriasQuemadas);

      this.comidaSeleccionada = opcionComida?.id ?? 'comida-personalizado';
      this.actividadSeleccionada = opcionActividad?.id ?? 'actividad-personalizado';
      this.caloriasComidaPersonalizadaHabito = opcionComida ? null : (habitos?.caloriasConsumidas ?? null);
      this.caloriasActividadPersonalizadaHabito = opcionActividad ? null : (habitos?.caloriasQuemadas ?? null);
    }
    this.modalActivo = modal;
  }


  cerrarModal(): void {
    this.modalActivo = 'ninguno';
    this.error = '';
    this.caloriasComidaInput = null;
    this.notaComidaInput = '';
    this.caloriasEjercicioInput = null;
    this.notaEjercicioInput = '';
    this.comidaSeleccionada = '';
    this.actividadSeleccionada = '';
    this.caloriasComidaPersonalizadaHabito = null;
    this.caloriasActividadPersonalizadaHabito = null;
  }

  confirmarComida(): void {
    if (!this.caloriasComidaInput || this.caloriasComidaInput < 1 || this.caloriasComidaInput > 3000) {
      this.error = 'Ingresá una cantidad de calorías válida (entre 1 y 3000).';
      return;
    }
    this.imcService.agregarRegistro('comida', this.caloriasComidaInput, this.notaComidaInput.trim() || undefined);
    this.cargarDatos();
    this.cerrarModal();
  }

  confirmarEjercicio(): void {
    if (!this.caloriasEjercicioInput || this.caloriasEjercicioInput < 1 || this.caloriasEjercicioInput > 2000) {
      this.error = 'Ingresá una cantidad de calorías válida (entre 1 y 2000).';
      return;
    }
    this.imcService.agregarRegistro('ejercicio', this.caloriasEjercicioInput, this.notaEjercicioInput.trim() || undefined);
    this.cargarDatos();
    this.cerrarModal();
  }


  eliminarRegistro(index: number): void {
    this.imcService.eliminarRegistro(index);
    this.cargarDatos();
  }


  irACalendario(): void {
    this.router.navigate(['/calendario']);
  }

  confirmarPerfil(): void {
    if (!this.alturaInput || this.alturaInput < 50 || this.alturaInput > 250) {
      this.error = 'Ingresá una altura válida (entre 50 y 250 cm).';
      return;
    }
    if (!this.pesoInput || this.pesoInput < 20 || this.pesoInput > 300) {
      this.error = 'Ingresá un peso válido (entre 20 y 300 kg).';
      return;
    }
    const resultado = this.imcService.actualizarPesoAltura(this.alturaInput, this.pesoInput);
    this.cerrarModal();

    if (resultado.hitoAlcanzado) {
      this.hitoTipo = resultado.hitoAlcanzado;
      this.modalHitoAbierto = true;
    }
  }

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
  caloriasComidaPersonalizadaHabito: number | null = null;
  caloriasActividadPersonalizadaHabito: number | null = null;

  get esComidaPersonalizada(): boolean {
    return this.comidaSeleccionada === 'comida-personalizado';
  }

  get esActividadPersonalizada(): boolean {
    return this.actividadSeleccionada === 'actividad-personalizado';
  }

  seleccionarComida(id: string): void {
    this.comidaSeleccionada = id;
    this.error = '';
  }

  seleccionarActividad(id: string): void {
    this.actividadSeleccionada = id;
    this.error = '';
  }


  confirmarHabitos(): void {
    this.error = '';

    if (!this.comidaSeleccionada || !this.actividadSeleccionada) {
      this.error = 'Elegí una opción en cada sección para continuar.';
      return;
    }

    let caloriasConsumidas: number | null;
    if (this.esComidaPersonalizada) {
      caloriasConsumidas = this.caloriasComidaPersonalizadaHabito;
      if (!caloriasConsumidas || caloriasConsumidas < 500 || caloriasConsumidas > 6000) {
        this.error = 'Ingresá un valor de calorías consumidas válido (entre 500 y 6000).';
        return;
      }
    } else {
      caloriasConsumidas = this.opcionesComidas.find(o => o.id === this.comidaSeleccionada)!.valor;
    }

    let caloriasQuemadas: number | null;
    if (this.esActividadPersonalizada) {
      caloriasQuemadas = this.caloriasActividadPersonalizadaHabito;
      if (!caloriasQuemadas || caloriasQuemadas < 800 || caloriasQuemadas > 6000) {
        this.error = 'Ingresá un valor de calorías quemadas válido (entre 800 y 6000).';
        return;
      }
    } else {
      caloriasQuemadas = this.opcionesActividad.find(o => o.id === this.actividadSeleccionada)!.valor;
    }

    this.imcService.setHabitos(caloriasConsumidas!, caloriasQuemadas!);
    this.cargarDatos();
    this.cerrarModal();
  }
}
