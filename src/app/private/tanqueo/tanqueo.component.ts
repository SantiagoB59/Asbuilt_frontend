import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

import { AuthService } from '../../services/auth.service';
import {
  TanqueoService,
  Tanqueo,
  MetricasTanqueo,
  FiltrosTanqueo
} from '../../services/tanqueo.service';

interface ActivoSelect {
  tipo: 'VEHICULO' | 'MAQUINARIA';
  id: number;
  nombre: string;
  detalle?: string;
  lectura?: number | null;
  unidad: 'KM' | 'HORAS';
}

@Component({
  selector: 'app-tanqueo',
  templateUrl: './tanqueo.component.html',
  styleUrls: ['./tanqueo.component.scss']
})
export class TanqueoComponent implements OnInit, OnDestroy {

  // =========================================================
  // ROLES
  // =========================================================

  esAdmin = false;

  // =========================================================
  // FORMULARIO
  // =========================================================

  fecha = '';
  activoSeleccionado = '';
  galones: number | null = null;
  precioGalon: number | null = null;
  tipoCombustible = 'DIESEL';
  estacion = '';
  numeroFactura = '';
  kmActual: number | null = null;
  horometroActual: number | null = null;
  observaciones = '';

  tiposCombustible = [
    'DIESEL',
    'GASOLINA',
    'ACPM',
    'OTRO'
  ];

  // =========================================================
  // DATOS
  // =========================================================

  activos: ActivoSelect[] = [];
  tanqueos: Tanqueo[] = [];
  metricas: MetricasTanqueo | null = null;

  // =========================================================
  // FILTROS
  // =========================================================

  fechaDesde = '';
  fechaHasta = '';
  estadoFiltro = '';

  // =========================================================
  // ESTADOS
  // =========================================================

  cargando = false;
  cargandoDatos = false;
  mensaje = '';
  error = '';

  // =========================================================
  // IMAGEN / CÁMARA
  // =========================================================

  archivo: File | null = null;
  fotoPreview: string | null = null;
  mostrarCamara = false;

  @ViewChild('videoCamara')
  videoCamara?: ElementRef<HTMLVideoElement>;

  private streamCamara: MediaStream | null = null;

  constructor(
    private tanqueoService: TanqueoService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const usuario = this.authService.getUser();

    const rol = (
      usuario?.rol || ''
    ).toString().toLowerCase().trim();

    this.esAdmin = [
      'admin',
      'administrador',
      'supervisor'
    ].includes(rol);

    this.fecha = this.obtenerFechaActual();

    this.cargarDatos();
  }

  ngOnDestroy(): void {
    this.cerrarCamara();
    this.limpiarPreview();
  }

  // =========================================================
  // CARGA GENERAL
  // =========================================================

  cargarDatos(): void {
    this.cargandoDatos = true;

    // Los roles administrativos también pueden tanquear:
    // cargamos sus activos para que escojan cuál tanquear.
    this.cargarActivos();

    this.cargarTanqueos();
    this.cargarMetricas();
  }

  cargarActivos(): void {
    this.tanqueoService
      .obtenerMisActivos()
      .subscribe({
        next: (respuesta) => {
          const lista: ActivoSelect[] = [];

          (respuesta?.vehiculos || []).forEach(
            (vehiculo: any) => {
              lista.push({
                tipo: 'VEHICULO',
                id: vehiculo.id,
                nombre: vehiculo.placa || `Vehículo ${vehiculo.id}`,
                detalle: [
                  vehiculo.marca,
                  vehiculo.modelo,
                  vehiculo.tipo
                ].filter(Boolean).join(' · '),
                lectura: vehiculo.km_actual ?? null,
                unidad: 'KM'
              });
            }
          );

          (respuesta?.maquinarias || []).forEach(
            (maquinaria: any) => {
              lista.push({
                tipo: 'MAQUINARIA',
                id: maquinaria.id,
                nombre: maquinaria.codigo || `Maquinaria ${maquinaria.id}`,
                detalle: [
                  maquinaria.marca,
                  maquinaria.modelo,
                  maquinaria.tipo
                ].filter(Boolean).join(' · '),
                lectura: maquinaria.horometro_actual ?? null,
                unidad: 'HORAS'
              });
            }
          );

          this.activos = lista;
        },
        error: (err) => {
          console.error('Error cargando activos:', err);
          this.activos = [];
          this.error =
            err?.error?.error ||
            'No fue posible cargar los activos asignados.';
        }
      });
  }

  cargarTanqueos(): void {
    const filtros = this.obtenerFiltros();

    const peticion = this.esAdmin
      ? this.tanqueoService.listarTanqueos(filtros)
      : this.tanqueoService.obtenerMisTanqueos(filtros);

    peticion.subscribe({
      next: (data) => {
        this.tanqueos = Array.isArray(data) ? data : [];
        this.cargandoDatos = false;
      },
      error: (err) => {
        console.error('Error cargando tanqueos:', err);
        this.tanqueos = [];
        this.cargandoDatos = false;
        this.error =
          err?.error?.error ||
          'No fue posible cargar los tanqueos.';
      }
    });
  }

  cargarMetricas(): void {
    const filtros = this.obtenerFiltros();

    const peticion = this.esAdmin
      ? this.tanqueoService.obtenerMetricas(filtros)
      : this.tanqueoService.obtenerMisMetricas(filtros);

    peticion.subscribe({
      next: (data) => {
        this.metricas = data;
      },
      error: (err) => {
        console.error('Error cargando métricas:', err);
        this.metricas = null;
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarTanqueos();
    this.cargarMetricas();
  }

  limpiarFiltros(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.estadoFiltro = '';
    this.aplicarFiltros();
  }

  private obtenerFiltros(): FiltrosTanqueo {
    const filtros: FiltrosTanqueo = {};

    if (this.fechaDesde) {
      filtros.fecha_desde = this.fechaDesde;
    }

    if (this.fechaHasta) {
      filtros.fecha_hasta = this.fechaHasta;
    }

    if (this.estadoFiltro) {
      filtros.estado = this.estadoFiltro;
    }

    return filtros;
  }

  // =========================================================
  // SELECCIÓN DE ACTIVO
  // =========================================================

  onActivoChange(): void {
    const activo = this.activos.find(
      item =>
        `${item.tipo}-${item.id}` ===
        this.activoSeleccionado
    );

    this.kmActual = null;
    this.horometroActual = null;

    if (!activo) {
      return;
    }

    if (activo.unidad === 'KM') {
      this.kmActual = activo.lectura ?? null;
    } else {
      this.horometroActual = activo.lectura ?? null;
    }
  }

  activoSeleccionadoObj(): ActivoSelect | null {
    return this.activos.find(
      item =>
        `${item.tipo}-${item.id}` ===
        this.activoSeleccionado
    ) || null;
  }

  // =========================================================
  // GUARDAR
  // =========================================================

  guardar(): void {
    this.mensaje = '';
    this.error = '';

    if (!this.fecha) {
      this.error = 'Seleccione la fecha del tanqueo.';
      return;
    }

    if (!this.activoSeleccionado) {
      this.error = 'Seleccione el vehículo o maquinaria.';
      return;
    }

    if (
      this.galones === null
      || this.galones <= 0
    ) {
      this.error = 'Ingrese la cantidad de galones.';
      return;
    }

    if (!this.archivo) {
      this.error =
        'Adjunte la imagen o soporte del tanqueo.';
      return;
    }

    const activo = this.activoSeleccionadoObj();

    if (!activo) {
      this.error = 'El activo seleccionado no es válido.';
      return;
    }

    this.cargando = true;

    this.tanqueoService.crearTanqueo({
      fecha: this.fecha,
      galones: this.galones,
      vehiculoId: activo.tipo === 'VEHICULO'
        ? activo.id
        : null,
      maquinariaId: activo.tipo === 'MAQUINARIA'
        ? activo.id
        : null,
      precioGalon: this.precioGalon,
      tipoCombustible: this.tipoCombustible,
      estacion: this.estacion,
      numeroFactura: this.numeroFactura,
      kmActual: activo.unidad === 'KM'
        ? this.kmActual
        : null,
      horometroActual: activo.unidad === 'HORAS'
        ? this.horometroActual
        : null,
      archivo: this.archivo,
      observaciones: this.observaciones
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.mensaje =
          'Tanqueo registrado correctamente.';

        this.limpiarFormulario();
        this.cargarTanqueos();
        this.cargarMetricas();
      },
      error: (err) => {
        console.error('Error registrando tanqueo:', err);
        this.cargando = false;
        this.error =
          err?.error?.error ||
          'No fue posible registrar el tanqueo.';
      }
    });
  }

  limpiarFormulario(): void {
    this.fecha = this.obtenerFechaActual();
    this.activoSeleccionado = '';
    this.galones = null;
    this.precioGalon = null;
    this.tipoCombustible = 'DIESEL';
    this.estacion = '';
    this.numeroFactura = '';
    this.kmActual = null;
    this.horometroActual = null;
    this.observaciones = '';

    this.eliminarFoto();
  }

  // =========================================================
  // IMAGEN
  // =========================================================

  seleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;

    const archivo =
      input.files && input.files.length > 0
        ? input.files[0]
        : null;

    this.asignarArchivo(archivo);
  }

  private asignarArchivo(archivo: File | null): void {
    this.limpiarPreview();
    this.archivo = archivo;

    if (
      archivo
      && archivo.type.startsWith('image/')
    ) {
      this.fotoPreview =
        URL.createObjectURL(archivo);
    }
  }

  eliminarFoto(): void {
    this.archivo = null;
    this.limpiarPreview();
  }

  private limpiarPreview(): void {
    if (this.fotoPreview) {
      URL.revokeObjectURL(this.fotoPreview);
      this.fotoPreview = null;
    }
  }

  async abrirCamara(): Promise<void> {
    this.error = '';

    if (!navigator.mediaDevices?.getUserMedia) {
      this.error =
        'La cámara no está disponible en este navegador. Puede seleccionar una imagen desde el dispositivo.';
      return;
    }

    try {
      this.mostrarCamara = true;

      this.streamCamara =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: 'environment'
            }
          },
          audio: false
        });

      setTimeout(() => {
        if (!this.videoCamara) {
          return;
        }

        const video =
          this.videoCamara.nativeElement;

        video.srcObject = this.streamCamara;
        video.play().catch(() => { });
      }, 100);

    } catch (err) {
      console.error('Error accediendo a cámara:', err);
      this.mostrarCamara = false;
      this.error =
        'No fue posible acceder a la cámara. Verifique los permisos o seleccione una imagen.';
    }
  }

  tomarFoto(): void {
    if (!this.videoCamara) {
      this.error = 'La cámara todavía no está lista.';
      return;
    }

    const video = this.videoCamara.nativeElement;

    if (
      !video.videoWidth
      || !video.videoHeight
    ) {
      this.error = 'La cámara todavía no está lista.';
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const contexto = canvas.getContext('2d');

    if (!contexto) {
      this.error =
        'No fue posible procesar la fotografía.';
      return;
    }

    contexto.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          this.error =
            'No fue posible generar la fotografía.';
          return;
        }

        const archivo = new File(
          [blob],
          `tanqueo-${Date.now()}.jpg`,
          { type: 'image/jpeg' }
        );

        this.asignarArchivo(archivo);
        this.cerrarCamara();
      },
      'image/jpeg',
      0.9
    );
  }

  cerrarCamara(): void {
    if (this.streamCamara) {
      this.streamCamara
        .getTracks()
        .forEach(track => track.stop());

      this.streamCamara = null;
    }

    if (this.videoCamara) {
      this.videoCamara.nativeElement.srcObject = null;
    }

    this.mostrarCamara = false;
  }

  // =========================================================
  // ADMIN
  // =========================================================

  validar(tanqueo: Tanqueo): void {
    this.tanqueoService
      .validar(tanqueo.id)
      .subscribe({
        next: () => {
          this.mensaje =
            'Tanqueo validado correctamente.';
          this.cargarTanqueos();
          this.cargarMetricas();
        },
        error: (err) => {
          this.error =
            err?.error?.error ||
            'No fue posible validar el tanqueo.';
        }
      });
  }

  rechazar(tanqueo: Tanqueo): void {
    const observacion = window.prompt(
      'Motivo del rechazo (opcional):'
    );

    this.tanqueoService
      .rechazar(tanqueo.id, observacion || undefined)
      .subscribe({
        next: () => {
          this.mensaje = 'Tanqueo rechazado.';
          this.cargarTanqueos();
          this.cargarMetricas();
        },
        error: (err) => {
          this.error =
            err?.error?.error ||
            'No fue posible rechazar el tanqueo.';
        }
      });
  }

  verSoporte(tanqueo: Tanqueo): void {
    const url = this.tanqueoService.urlArchivo(
      tanqueo.archivo_path
    );

    if (url) {
      window.open(url, '_blank');
    }
  }

  // =========================================================
  // UTILIDADES
  // =========================================================

  private obtenerFechaActual(): string {
    const ahora = new Date();

    const year = ahora.getFullYear();
    const month = String(
      ahora.getMonth() + 1
    ).padStart(2, '0');
    const day = String(
      ahora.getDate()
    ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  estadoClass(estado?: string): string {
    switch ((estado || '').toUpperCase()) {
      case 'VALIDADO':
        return 'estado-validado';
      case 'RECHAZADO':
        return 'estado-rechazado';
      default:
        return 'estado-registrado';
    }
  }
}
