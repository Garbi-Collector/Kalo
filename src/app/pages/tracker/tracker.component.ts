import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImcService, RegistroDia, ResumenCalorico } from '../../services/imc.service';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';

type ModalActivo = 'ninguno' | 'comida' | 'ejercicio' | 'perfil';

@Component({
  selector: 'app-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, TopBarComponent, BottomNavComponent],
  templateUrl: './tracker.component.html',
  styleUrl: './tracker.component.css'
})
export class TrackerComponent implements OnInit {
  resumen: ResumenCalorico = {
    consumidoBase: 0, consumidoExtra: 0, consumidoTotal: 0,
    quemadoBase: 0, quemadoExtra: 0, quemadoTotal: 0, balance: 0
  };
  registros: RegistroDia[] = [];

  modalActivo: ModalActivo = 'ninguno';
  error = '';

  caloriasComidaInput: number | null = null;
  notaComidaInput = '';

  caloriasEjercicioInput: number | null = null;
  notaEjercicioInput = '';

  alturaInput: number | null = null;
  pesoInput: number | null = null;

  constructor(private imcService: ImcService) {}

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
    this.modalActivo = modal;
  }

  cerrarModal(): void {
    this.modalActivo = 'ninguno';
    this.error = '';
    this.caloriasComidaInput = null;
    this.notaComidaInput = '';
    this.caloriasEjercicioInput = null;
    this.notaEjercicioInput = '';
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

  confirmarPerfil(): void {
    if (!this.alturaInput || this.alturaInput < 50 || this.alturaInput > 250) {
      this.error = 'Ingresá una altura válida (entre 50 y 250 cm).';
      return;
    }
    if (!this.pesoInput || this.pesoInput < 20 || this.pesoInput > 300) {
      this.error = 'Ingresá un peso válido (entre 20 y 300 kg).';
      return;
    }
    this.imcService.actualizarPesoAltura(this.alturaInput, this.pesoInput);
    this.cerrarModal();
  }

  eliminarRegistro(index: number): void {
    this.imcService.eliminarRegistro(index);
    this.cargarDatos();
  }
}
