import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ImcService } from '../../services/imc.service';
import { BottomNavComponent } from '../../shared/bottom-nav/bottom-nav.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';

const ML_POR_VASO = 250;
const LITROS_RECOMENDADOS = 2;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, BottomNavComponent,TopBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  pesoActual = 0;
  altura = 0;
  pesoObjetivo: number | null = null;
  diferenciaKg = 0;
  direccion: 'bajar' | 'subir' | 'mantener' | 'sin-objetivo' = 'sin-objetivo';

  vasosAgua = 0;
  mlPorVaso = ML_POR_VASO;
  litrosRecomendados = LITROS_RECOMENDADOS;
  modalAguaAbierto = false;

  get vasosRecomendados(): number {
    return Math.round((this.litrosRecomendados * 1000) / this.mlPorVaso);
  }

  get progresoAgua(): number {
    const objetivoMl = this.litrosRecomendados * 1000;
    const actualMl = this.vasosAgua * this.mlPorVaso;
    return Math.min(100, Math.round((actualMl / objetivoMl) * 100));
  }

  constructor(private imcService: ImcService, private router: Router) {}

  ngOnInit(): void {
    const datos = this.imcService.obtenerDatos();
    if (!datos) {
      this.router.navigate(['/']);
      return;
    }
    this.pesoActual = datos.peso;
    this.altura = datos.altura;
    this.pesoObjetivo = this.imcService.obtenerPesoObjetivo();

    if (this.pesoObjetivo) {
      const diff = Math.round((this.pesoObjetivo - this.pesoActual) * 10) / 10;
      this.diferenciaKg = Math.abs(diff);
      if (diff < -0.5) this.direccion = 'bajar';
      else if (diff > 0.5) this.direccion = 'subir';
      else this.direccion = 'mantener';
    } else {
      this.direccion = 'sin-objetivo';
    }

    this.vasosAgua = this.imcService.obtenerVasosAgua();
  }

  sumarAgua(): void {
    this.vasosAgua = this.imcService.sumarVasoAgua();
  }

  abrirModalAgua(event: Event): void {
    event.stopPropagation();
    this.modalAguaAbierto = true;
  }

  cerrarModalAgua(): void {
    this.modalAguaAbierto = false;
  }
}
