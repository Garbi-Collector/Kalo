import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImcService, EvaluacionObjetivo } from '../../services/imc.service';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.css'
})
export class ResultadoComponent implements OnInit {
  altura = 0;
  peso = 0;
  imc = 0;
  categoria = '';
  descripcionCategoria = '';
  colorCategoria = '';
  pesoMinSaludable = 0;
  pesoMaxSaludable = 0;

  pesoObjetivo: number | null = null;
  evaluacion: EvaluacionObjetivo | null = null;
  errorObjetivo = '';

  constructor(private imcService: ImcService, private router: Router) {}

  ngOnInit(): void {
    const datos = this.imcService.obtenerDatos();
    if (!datos) {
      this.router.navigate(['/']);
      return;
    }

    this.altura = datos.altura;
    this.peso = datos.peso;
    this.imc = this.imcService.calcularImc(this.peso, this.altura);

    const infoCategoria = this.imcService.obtenerCategoria(this.imc);
    this.categoria = infoCategoria.nombre;
    this.descripcionCategoria = infoCategoria.descripcion;
    this.colorCategoria = infoCategoria.color;

    const rango = this.imcService.obtenerRangoSaludable(this.altura);
    this.pesoMinSaludable = rango.min;
    this.pesoMaxSaludable = rango.max;
  }

  evaluarObjetivo(): void {
    this.errorObjetivo = '';
    this.evaluacion = null;

    if (!this.pesoObjetivo) {
      this.errorObjetivo = 'Ingresá el peso al que te gustaría llegar.';
      return;
    }
    if (this.pesoObjetivo < 20 || this.pesoObjetivo > 300) {
      this.errorObjetivo = 'Ingresá un peso objetivo válido.';
      return;
    }

    this.evaluacion = this.imcService.evaluarObjetivo(this.peso, this.altura, this.pesoObjetivo);
  }

  irAHabitos(): void {
    this.router.navigate(['/habitos']);
  }
  
  volver(): void {
    this.router.navigate(['/']);
  }
}
