import { Injectable } from '@angular/core';

export interface DatosUsuario {
  altura: number; // cm
  peso: number;   // kg
}

export interface CategoriaImc {
  nombre: string;
  descripcion: string;
  color: string;
}

export interface EvaluacionObjetivo {
  imcObjetivo: number;
  categoriaObjetivo: CategoriaImc;
  direccion: 'bajar' | 'subir' | 'mantener';
  diferenciaKg: number;
  porcentajeCambio: number;
  esSaludable: boolean;
  esCambioBrusco: boolean;
  mensaje: string;
}
export interface DatosHabitos {
  caloriasConsumidas: number;
  caloriasQuemadas: number;
}

@Injectable({ providedIn: 'root' })
export class ImcService {
  private datos: DatosUsuario | null = null;
  private habitos: DatosHabitos | null = null;

  setDatosIniciales(altura: number, peso: number): void {
    this.datos = { altura, peso };
  }

  obtenerDatos(): DatosUsuario | null {
    return this.datos;
  }

  calcularImc(peso: number, alturaCm: number): number {
    const alturaM = alturaCm / 100;
    return Math.round((peso / (alturaM * alturaM)) * 10) / 10;
  }

  obtenerCategoria(imc: number): CategoriaImc {
    if (imc < 18.5) {
      return {
        nombre: 'Bajo peso',
        descripcion: 'Tu peso está por debajo del rango considerado saludable para tu altura. Podría ser recomendable ganar algo de peso de forma controlada y consultar con un profesional de la salud.',
        color: 'var(--color-info)'
      };
    }
    if (imc < 25) {
      return {
        nombre: 'Peso normal',
        descripcion: 'Tu peso está dentro del rango considerado saludable para tu altura. ¡Seguí así, cuidando tu alimentación y actividad física!',
        color: 'var(--color-success)'
      };
    }
    if (imc < 30) {
      return {
        nombre: 'Sobrepeso',
        descripcion: 'Tu peso está algo por encima del rango saludable para tu altura. No es una condición grave, pero bajar de a poco podría beneficiar tu salud a largo plazo.',
        color: 'var(--color-warning)'
      };
    }
    if (imc < 35) {
      return {
        nombre: 'Obesidad grado I',
        descripcion: 'Tu peso está considerablemente por encima del rango saludable. Se recomienda bajar de peso de forma gradual, idealmente con acompañamiento profesional.',
        color: 'var(--color-danger)'
      };
    }
    if (imc < 40) {
      return {
        nombre: 'Obesidad grado II',
        descripcion: 'Tu IMC indica un nivel de obesidad importante, que puede implicar riesgos para tu salud. Te recomendamos consultar con un profesional de la salud.',
        color: 'var(--color-danger)'
      };
    }
    return {
      nombre: 'Obesidad grado III',
      descripcion: 'Tu IMC indica un nivel de obesidad severa. Es importante que consultes con un profesional de la salud para recibir acompañamiento.',
      color: 'var(--color-danger)'
    };
  }

  obtenerRangoSaludable(alturaCm: number): { min: number; max: number } {
    const alturaM = alturaCm / 100;
    return {
      min: Math.round(18.5 * alturaM * alturaM * 10) / 10,
      max: Math.round(24.9 * alturaM * alturaM * 10) / 10
    };
  }

  evaluarObjetivo(pesoActual: number, alturaCm: number, pesoObjetivo: number): EvaluacionObjetivo {
    const imcObjetivo = this.calcularImc(pesoObjetivo, alturaCm);
    const categoriaObjetivo = this.obtenerCategoria(imcObjetivo);

    const diferenciaKg = Math.round((pesoObjetivo - pesoActual) * 10) / 10;
    const porcentajeCambio = Math.round((Math.abs(diferenciaKg) / pesoActual) * 1000) / 10;

    let direccion: 'bajar' | 'subir' | 'mantener' = 'mantener';
    if (diferenciaKg < -0.5) direccion = 'bajar';
    else if (diferenciaKg > 0.5) direccion = 'subir';

    const esSaludable = imcObjetivo >= 18.5 && imcObjetivo < 25;
    const esCambioBrusco = porcentajeCambio >= 15;

    let mensaje = '';

    if (direccion === 'mantener') {
      mensaje = 'Tu peso objetivo es prácticamente el mismo que tenés ahora. Si estás en un rango saludable, mantenerte es una excelente meta.';
    } else if (esSaludable) {
      mensaje = direccion === 'bajar'
        ? `Bajar hasta ${pesoObjetivo} kg es un objetivo saludable para tu altura. `
        : `Subir hasta ${pesoObjetivo} kg es un objetivo saludable para tu altura. `;
      mensaje += esCambioBrusco
        ? 'Aun así, es un cambio importante: te recomendamos hacerlo de forma gradual y con acompañamiento profesional.'
        : 'Es un cambio moderado y alcanzable con constancia.';
    } else if (imcObjetivo < 18.5) {
      mensaje = `Llegar a ${pesoObjetivo} kg te dejaría por debajo del peso saludable para tu altura. No es un objetivo recomendable: podría afectar tu salud.`;
    } else {
      mensaje = `Llegar a ${pesoObjetivo} kg todavía te dejaría en la categoría "${categoriaObjetivo.nombre}". `;
      mensaje += direccion === 'bajar'
        ? 'Igual, si estás bajando desde un peso mayor, es un paso en la dirección correcta.'
        : 'Te recomendamos reconsiderar esta meta y apuntar a un rango más saludable.';
    }

    return { imcObjetivo, categoriaObjetivo, direccion, diferenciaKg, porcentajeCambio, esSaludable, esCambioBrusco, mensaje };
  }


  setHabitos(caloriasConsumidas: number, caloriasQuemadas: number): void {
    this.habitos = { caloriasConsumidas, caloriasQuemadas };
  }

  obtenerHabitos(): DatosHabitos | null {
    return this.habitos;
  }
}
