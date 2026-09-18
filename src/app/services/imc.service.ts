import { Injectable } from '@angular/core';

// ==========================================
// INTERFACES
// ==========================================

export interface DatosUsuario {
  altura: number;
  peso: number;
}

export interface DatosHabitos {
  caloriasConsumidas: number;
  caloriasQuemadas: number;
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

export interface RegistroAgua {
  fecha: string; // formato YYYY-MM-DD
  vasos: number;
}

export interface RegistroDiaHistorico {
  fecha: string;
  consumido: number;
  quemado: number;
  vasosAgua: number;
  esAutomatico: boolean;
  balance: number;
  hitoKilo?: 'perdido' | 'ganado' | null;
  hitoEsManual?: boolean;
  registros: RegistroDia[];
}

export interface RegistroPeso {
  fecha: string;
  peso: number;
}

export interface ProyeccionKilo {
  fecha: string;
  tipo: 'perdido' | 'ganado';
}

export interface MarcaDia {
  color: 'rojo' | 'amarillo' | 'verde' | 'naranja' | 'sin-datos' | 'futuro';
  esHoy: boolean;
}

export interface InfoDiaModal {
  estado: 'sin-datos' | 'futuro' | 'con-datos';
  consejo?: string;
  consumido?: number;
  quemado?: number;
  vasosAgua?: number;
  resultado?: 'gano' | 'perdio' | 'igual';
  diferencia?: number;
  hitoKilo?: 'perdido' | 'ganado' | null;
  esHitoManual?: boolean;
  registros?: RegistroDia[];
}

interface EstadoKalo {
  datos: DatosUsuario | null;
  habitos: DatosHabitos | null;
  pesoObjetivo: number | null;
  notificacionesActivadas: boolean;
  diaTracker: DiaTracker | null;
  agua: RegistroAgua | null;
  historialDias: Record<string, RegistroDiaHistorico>;
  historialPeso: RegistroPeso[];
  ultimaFechaProcesada: string | null;
  fechaInicioProyeccion: string | null;
  proyeccionKilo: ProyeccionKilo | null;
}

const STORAGE_KEY = 'kalo_estado';
const KCAL_POR_KILO = 7700;

@Injectable({ providedIn: 'root' })
export class ImcService {

  // ==========================================
  // ESTADO Y PERSISTENCIA
  // ==========================================

  private estado: EstadoKalo = {
    datos: null,
    habitos: null,
    pesoObjetivo: null,
    notificacionesActivadas: false,
    diaTracker: null,
    agua: null,
    historialDias: {},
    historialPeso: [],
    ultimaFechaProcesada: null,
    fechaInicioProyeccion: null,
    proyeccionKilo: null
  };

  constructor() {
    this.cargarDesdeStorage();
    this.procesarDiasPendientes();
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

  reiniciarDatos(): void {
    this.estado = {
      datos: null,
      habitos: null,
      pesoObjetivo: null,
      notificacionesActivadas: false,
      diaTracker: null,
      agua: null,
      historialDias: {},
      historialPeso: [],
      ultimaFechaProcesada: null,
      fechaInicioProyeccion: null,
      proyeccionKilo: null
    };
    this.guardarEnStorage();
  }

  private hoyISO(): string {
    return new Date().toISOString().split('T')[0];
  }
  private redondear2(valor: number): number {
    return Math.round(valor * 100) / 100;
  }

  private sumarDias(fechaISO: string, dias: number): string {
    const fecha = new Date(fechaISO + 'T00:00:00');
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().split('T')[0];
  }

  // ==========================================
  // ONBOARDING: DATOS BÁSICOS, HÁBITOS, OBJETIVO
  // ==========================================

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

  obtenerDireccionObjetivo(): 'bajar' | 'subir' | 'mantener' {
    const datos = this.estado.datos;
    const objetivo = this.estado.pesoObjetivo;
    if (!datos || !objetivo) return 'mantener';
    const diff = objetivo - datos.peso;
    if (diff < -0.5) return 'bajar';
    if (diff > 0.5) return 'subir';
    return 'mantener';
  }

  // ==========================================
  // IMC
  // ==========================================

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

  // ==========================================
  // AGUA
  // ==========================================

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

  // ==========================================
  // TRACKER DEL DÍA (comida extra / ejercicio)
  // ==========================================

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
      balance: this.redondear2(quemadoTotal - consumidoTotal)
    };
  }

  // ==========================================
  // PESO / ALTURA (edición + detección de hito)
  // ==========================================

  actualizarPesoAltura(altura: number, peso: number): { hitoAlcanzado: 'perdido' | 'ganado' | null } {
    const pesoAnterior = this.estado.datos?.peso ?? peso;
    this.estado.datos = { altura, peso };

    const hoy = this.hoyISO();
    this.estado.historialPeso.push({ fecha: hoy, peso });

    let hitoAlcanzado: 'perdido' | 'ganado' | null = null;
    const diff = Math.round((peso - pesoAnterior) * 10) / 10;
    const objetivo = this.obtenerDireccionObjetivo();

    const perdioKilo = diff <= -0.9;
    const ganoKilo = diff >= 0.9;

    if ((objetivo === 'bajar' && perdioKilo) || (objetivo === 'subir' && ganoKilo)) {
      hitoAlcanzado = objetivo === 'bajar' ? 'perdido' : 'ganado';

      if (!this.estado.historialDias[hoy]) {
        this.estado.historialDias[hoy] = {
          fecha: hoy, consumido: 0, quemado: 0, vasosAgua: 0,
          esAutomatico: true, balance: 0, hitoKilo: null, hitoEsManual: false,
          registros: []
        };
      }
      this.estado.historialDias[hoy].hitoKilo = hitoAlcanzado;
      this.estado.historialDias[hoy].hitoEsManual = true;

      this.estado.proyeccionKilo = null;
      this.estado.fechaInicioProyeccion = hoy;
    }

    this.guardarEnStorage();
    return { hitoAlcanzado };
  }

  // ==========================================
  // CIERRE DIARIO Y PROYECCIÓN DE KILO
  // ==========================================

  private cerrarDia(fecha: string): void {
    const habitos = this.estado.habitos;
    const consumidoBase = habitos?.caloriasConsumidas ?? 0;
    const quemadoBase = habitos?.caloriasQuemadas ?? 0;

    let consumidoExtra = 0;
    let quemadoExtra = 0;
    let esAutomatico = true;
    let registrosDelDia: RegistroDia[] = [];

    if (this.estado.diaTracker && this.estado.diaTracker.fecha === fecha) {
      registrosDelDia = this.estado.diaTracker.registros;
      consumidoExtra = registrosDelDia
        .filter(r => r.tipo === 'comida')
        .reduce((s, r) => s + r.calorias, 0);
      quemadoExtra = registrosDelDia
        .filter(r => r.tipo === 'ejercicio')
        .reduce((s, r) => s + r.calorias, 0);
      esAutomatico = registrosDelDia.length === 0;
    }

    let vasosAgua = 0;
    if (this.estado.agua && this.estado.agua.fecha === fecha) {
      vasosAgua = this.estado.agua.vasos;
    }

    const consumido = consumidoBase + consumidoExtra;
    const quemado = quemadoBase + quemadoExtra;
    const balance = this.redondear2(quemado - consumido);

    this.estado.historialDias[fecha] = {
      fecha, consumido, quemado, vasosAgua, esAutomatico, balance,
      hitoKilo: null, hitoEsManual: false,
      registros: registrosDelDia
    };

    if (!this.estado.fechaInicioProyeccion) {
      this.estado.fechaInicioProyeccion = fecha;
    }
  }

  private procesarDiasPendientes(): void {
    const hoy = this.hoyISO();
    const ultima = this.estado.ultimaFechaProcesada;

    if (!ultima) {
      this.estado.ultimaFechaProcesada = hoy;
      this.guardarEnStorage();
      return;
    }
    if (ultima === hoy) return;

    let cursor = ultima;
    while (cursor < hoy) {
      this.cerrarDia(cursor);
      cursor = this.sumarDias(cursor, 1);
    }

    this.estado.ultimaFechaProcesada = hoy;
    this.recalcularProyeccionKilo();
    this.guardarEnStorage();
  }

  private recalcularProyeccionKilo(): void {
    const inicio = this.estado.fechaInicioProyeccion;
    if (!inicio) { this.estado.proyeccionKilo = null; return; }

    const dias = Object.values(this.estado.historialDias).filter(d => d.fecha >= inicio);
    if (dias.length === 0) { this.estado.proyeccionKilo = null; return; }

    const promedio = dias.reduce((s, d) => s + d.balance, 0) / dias.length;
    if (Math.abs(promedio) < 1) { this.estado.proyeccionKilo = null; return; }

    const diasParaKilo = Math.round(KCAL_POR_KILO / Math.abs(promedio));
    const tipo: 'perdido' | 'ganado' = promedio > 0 ? 'perdido' : 'ganado';
    const fechaObjetivo = this.sumarDias(this.hoyISO(), diasParaKilo);

    this.estado.proyeccionKilo = { fecha: fechaObjetivo, tipo };
  }

  // ==========================================
  // CALENDARIO: colores, consejos y modal de día
  // ==========================================

  private obtenerColorBalance(balance: number): 'rojo' | 'amarillo' | 'verde' {
    if (Math.abs(balance) < 1) return 'amarillo';
    const quemoMas = balance > 0;
    const objetivo = this.obtenerDireccionObjetivo();
    if (objetivo === 'subir') {
      return quemoMas ? 'rojo' : 'verde';
    }
    return quemoMas ? 'verde' : 'rojo';
  }

  obtenerMarcaDia(fecha: string): MarcaDia {
    const hoy = this.hoyISO();
    const esHoy = fecha === hoy;
    const registro = this.estado.historialDias[fecha];

    if (registro?.hitoKilo) {
      return { color: 'naranja', esHoy };
    }
    if (this.estado.proyeccionKilo?.fecha === fecha && fecha >= hoy) {
      return { color: 'naranja', esHoy };
    }
    if (fecha > hoy) {
      return { color: 'futuro', esHoy: false };
    }
    if (!registro) {
      return { color: 'sin-datos', esHoy };
    }
    return { color: this.obtenerColorBalance(registro.balance), esHoy };
  }

  private readonly consejosFuturo = [
    'Todo se construye día a día: enfocate en las decisiones de hoy.',
    'El futuro todavía no tiene datos porque depende de lo que hagas hoy.',
    'No hay nada que preocuparse por adelantado: cada día se registra cuando llega.',
    'Cada comida y cada vaso de agua de hoy son los que van a definir este día cuando llegue.',
    'La constancia de hoy es la que arma el resultado de mañana.',
    'Un buen día empieza por registrar tus hábitos con honestidad.',
    'Todavía no pasó nada: seguí enfocado en el presente.',
    'Los resultados no se adelantan, se construyen registrando día a día.'
  ];

  obtenerConsejoFuturo(fecha: string): string {
    let hash = 0;
    for (let i = 0; i < fecha.length; i++) hash = (hash * 31 + fecha.charCodeAt(i)) >>> 0;
    return this.consejosFuturo[hash % this.consejosFuturo.length];
  }

  obtenerInfoDia(fecha: string): InfoDiaModal {
    const hoy = this.hoyISO();

    if (fecha > hoy) {
      return { estado: 'futuro', consejo: this.obtenerConsejoFuturo(fecha) };
    }

    const esHoy = fecha === hoy;
    const registro = this.estado.historialDias[fecha];

    if (!registro && !esHoy) {
      return { estado: 'sin-datos' };
    }

    let consumido: number, quemado: number, vasosAgua: number;
    let hitoKilo: 'perdido' | 'ganado' | null = null;
    let esHitoManual = false;
    let registros: RegistroDia[] = [];

    if (esHoy) {
      const resumen = this.obtenerResumenCalorico();
      consumido = resumen.consumidoTotal;
      quemado = resumen.quemadoTotal;
      vasosAgua = this.obtenerVasosAgua();
      hitoKilo = registro?.hitoKilo ?? null;
      esHitoManual = registro?.hitoEsManual ?? false;
      registros = this.obtenerRegistrosHoy();
    } else {
      consumido = registro!.consumido;
      quemado = registro!.quemado;
      vasosAgua = registro!.vasosAgua;
      hitoKilo = registro!.hitoKilo ?? null;
      esHitoManual = registro!.hitoEsManual ?? false;
      registros = registro!.registros ?? [];
    }

    const diferencia = this.redondear2(Math.abs(quemado - consumido));
    const resultado: 'gano' | 'perdio' | 'igual' =
      diferencia === 0 ? 'igual' : (consumido > quemado ? 'gano' : 'perdio');

    return { estado: 'con-datos', consumido, quemado, vasosAgua, resultado, diferencia, hitoKilo, esHitoManual, registros };
  }
}
