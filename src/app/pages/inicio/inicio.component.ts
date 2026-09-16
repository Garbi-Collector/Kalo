import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImcService } from '../../services/imc.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css'
})
export class InicioComponent {
  altura: number | null = null;
  peso: number | null = null;
  error = '';

  constructor(private imcService: ImcService, private router: Router) {}

  calcular(): void {
    this.error = '';

    if (!this.altura || !this.peso) {
      this.error = 'Completá tu altura y tu peso para continuar.';
      return;
    }
    if (this.altura < 50 || this.altura > 250) {
      this.error = 'Ingresá una altura válida (entre 50 y 250 cm).';
      return;
    }
    if (this.peso < 20 || this.peso > 300) {
      this.error = 'Ingresá un peso válido (entre 20 y 300 kg).';
      return;
    }

    this.imcService.setDatosIniciales(this.altura, this.peso);
    this.router.navigate(['/resultado']);
  }
}
