import { Injectable } from '@angular/core';

export interface DatosUsuario {
  altura: number;
  peso: number;
}

export interface DatosHabitos {
  caloriasConsumidas: number;
  caloriasQuemadas: number;
}

export interface RegistroDia {
  tipo: 'comida' | 'ejercicio';
  calorias: number;
  nota?: string;
  hora: string;
}

export interface DiaTracker {
  fecha: string;
  registros: RegistroDia[];
}

export interface ResumenCalorico {
  consumidoBase: number;
  consumidoExtra: number;
  consumidoTotal: number;
  quemadoBase: number;
  quemadoExtra: number;
  quemadoTotal: number;
  balance: number;
}

export interface CategoriaImc {
  nombre: string;
  descripcion: string;
  color: string;
}

export interface RegistroAgua {
  fecha: string; // formato YYYY-MM-DD
  vasos: number;
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

interface EstadoKalo {
  diaTracker: DiaTracker | null;
  agua: RegistroAgua | null;
  datos: DatosUsuario | null;
  habitos: DatosHabitos | null;
  pesoObjetivo: number | null;
  notificacionesActivadas: boolean;
}

const STORAGE_KEY = 'kalo_estado';

@Injectable({ providedIn: 'root' })
export class ImcService {
  private estado: EstadoKalo = {
    diaTracker: null,
    agua: null,
    datos: null,
    habitos: null,
    pesoObjetivo: null,
    notificacionesActivadas: false
  };

  constructor() {
    this.cargarDesdeStorage();
  }

  private cargarDesdeStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.estado = { ...this.estado, ...JSON.parse(raw) };
      }
    } catch {
      // Si el JSON está corrupto o localStorage no está disponible, seguimos con el estado default
    }
  }

  private guardarEnStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.estado));
    } catch {
      // Si falla (ej: modo incógnito o storage lleno), la app sigue funcionando en memoria
    }
  }

  setDatosIniciales(altura: number, peso: number): void {
    this.estado.datos = { altura, peso };
    this.guardarEnStorage();
  }

  obtenerDatos(): DatosUsuario | null {
    return this.estado.datos;
  }

  setHabitos(caloriasConsumidas: number, caloriasQuemadas: number): void {
    this.estado.habitos = { caloriasConsumidas, caloriasQuemadas };
    this.guardarEnStorage();
  }

  obtenerHabitos(): DatosHabitos | null {
    return this.estado.habitos;
  }

  setPesoObjetivo(peso: number): void {
    this.estado.pesoObjetivo = peso;
    this.guardarEnStorage();
  }

  obtenerPesoObjetivo(): number | null {
    return this.estado.pesoObjetivo;
  }

  setNotificacionesActivadas(valor: boolean): void {
    this.estado.notificacionesActivadas = valor;
    this.guardarEnStorage();
  }

  obtenerNotificacionesActivadas(): boolean {
    return this.estado.notificacionesActivadas;
  }

  reiniciarDatos(): void {
    this.estado = {diaTracker: null, agua: null, datos: null, habitos: null, pesoObjetivo: null, notificacionesActivadas: false };
    this.guardarEnStorage();
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


  private hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }

  obtenerVasosAgua(): number {
    const hoy = this.hoyISO();
    if (!this.estado.agua || this.estado.agua.fecha !== hoy) {
      return 0;
    }
    return this.estado.agua.vasos;
  }

  sumarVasoAgua(): number {
    const hoy = this.hoyISO();
    if (!this.estado.agua || this.estado.agua.fecha !== hoy) {
      this.estado.agua = { fecha: hoy, vasos: 0 };
    }
    this.estado.agua.vasos++;
    this.guardarEnStorage();
    return this.estado.agua.vasos;
  }

  actualizarPesoAltura(altura: number, peso: number): void {
    this.estado.datos = { altura, peso };
    this.guardarEnStorage();
  }

  tieneOnboardingCompleto(): boolean {
    const datos = this.estado.datos;
    const habitos = this.estado.habitos;
    const pesoObjetivo = this.estado.pesoObjetivo;

    return !!(
      datos?.altura &&
      datos?.peso &&
      habitos?.caloriasConsumidas &&
      habitos?.caloriasQuemadas &&
      pesoObjetivo
    );
  }

  private obtenerOCrearDiaTracker(): DiaTracker {
    const hoy = this.hoyISO();
    if (!this.estado.diaTracker || this.estado.diaTracker.fecha !== hoy) {
      this.estado.diaTracker = { fecha: hoy, registros: [] };
    }
    return this.estado.diaTracker;
  }

  obtenerRegistrosHoy(): RegistroDia[] {
    const hoy = this.hoyISO();
    if (!this.estado.diaTracker || this.estado.diaTracker.fecha !== hoy) {
      return [];
    }
    return this.estado.diaTracker.registros;
  }

  agregarRegistro(tipo: 'comida' | 'ejercicio', calorias: number, nota?: string): void {
    const dia = this.obtenerOCrearDiaTracker();
    const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    dia.registros.push({ tipo, calorias, nota, hora });
    this.guardarEnStorage();
  }

  eliminarRegistro(index: number): void {
    const registros = this.obtenerRegistrosHoy();
    if (index >= 0 && index < registros.length) {
      registros.splice(index, 1);
      this.guardarEnStorage();
    }
  }

  obtenerResumenCalorico(): ResumenCalorico {
    const habitos = this.estado.habitos;
    const registros = this.obtenerRegistrosHoy();

    const consumidoBase = habitos?.caloriasConsumidas ?? 0;
    const quemadoBase = habitos?.caloriasQuemadas ?? 0;

    const consumidoExtra = registros
      .filter(r => r.tipo === 'comida')
      .reduce((sum, r) => sum + r.calorias, 0);

    const quemadoExtra = registros
      .filter(r => r.tipo === 'ejercicio')
      .reduce((sum, r) => sum + r.calorias, 0);

    const consumidoTotal = consumidoBase + consumidoExtra;
    const quemadoTotal = quemadoBase + quemadoExtra;

    return {
      consumidoBase,
      consumidoExtra,
      consumidoTotal,
      quemadoBase,
      quemadoExtra,
      quemadoTotal,
      balance: quemadoTotal - consumidoTotal
    };
  }
}
