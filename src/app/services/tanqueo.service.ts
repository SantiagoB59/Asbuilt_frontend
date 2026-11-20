import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environment/environment';

export interface ActivoTanqueo {
  id: number;
  placa?: string;
  codigo?: string;
  tipo?: string;
  marca?: string;
  modelo?: string;
  estado?: string;
  horometro_actual?: number;
  km_actual?: number;
}

export interface ActivosTanqueoResponse {
  vehiculos: ActivoTanqueo[];
  maquinarias: ActivoTanqueo[];
}

export interface Tanqueo {
  id: number;
  fecha: string;
  usuario_id: number;
  usuario?: string;

  vehiculo_id?: number | null;
  maquinaria_id?: number | null;
  tipo_activo?: 'VEHICULO' | 'MAQUINARIA';
  activo_id?: number;
  activo_nombre?: string;
  unidad?: 'KM' | 'HORAS';
  lectura?: number | null;

  tipo_combustible?: string;
  galones: number;
  precio_galon?: number | null;
  valor_total?: number | null;

  estacion?: string | null;
  numero_factura?: string | null;

  km_actual?: number | null;
  horometro_actual?: number | null;

  archivo_path: string;
  archivo_nombre: string;
  archivo_tipo?: string;
  archivo_url?: string;

  estado?: string;
  observaciones?: string | null;
  validado_por?: number | null;
  validador?: string | null;
  validado_at?: string | null;
  observacion_validacion?: string | null;

  created_at?: string;
  updated_at?: string;
}

export interface MetricasTanqueo {
  resumen: {
    tanqueos: number;
    activos: number;
    total_galones: number;
    total_costo: number;
    recorrido_total: number;
    rendimiento_promedio: number | null;
    costo_por_unidad: number | null;
    precio_galon_promedio: number | null;
  };
  por_activo: any[];
  por_mes: any[];
  por_operador: any[];
  mejor_rendimiento: any | null;
  peor_rendimiento: any | null;
}

export interface FiltrosTanqueo {
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_id?: number;
  vehiculo_id?: number;
  maquinaria_id?: number;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TanqueoService {

  private apiUrl =
    `${environment.apiUrl}/api/tanqueos`;

  constructor(
    private http: HttpClient
  ) { }

  // =========================================================
  // ACTIVOS ASIGNADOS AL OPERADOR
  // =========================================================

  obtenerMisActivos(): Observable<ActivosTanqueoResponse> {
    return this.http.get<ActivosTanqueoResponse>(
      `${this.apiUrl}/mis-activos`
    );
  }

  // =========================================================
  // CREAR TANQUEO
  // =========================================================

  crearTanqueo(data: {
    fecha: string;
    galones: number;
    vehiculoId?: number | null;
    maquinariaId?: number | null;
    precioGalon?: number | null;
    tipoCombustible?: string;
    estacion?: string;
    numeroFactura?: string;
    kmActual?: number | null;
    horometroActual?: number | null;
    archivo: File;
    observaciones?: string;
  }): Observable<Tanqueo> {

    const formData = new FormData();

    formData.append('fecha', data.fecha);
    formData.append(
      'galones',
      String(data.galones)
    );

    if (data.vehiculoId) {
      formData.append(
        'vehiculo_id',
        String(data.vehiculoId)
      );
    }

    if (data.maquinariaId) {
      formData.append(
        'maquinaria_id',
        String(data.maquinariaId)
      );
    }

    if (
      data.precioGalon !== null
      && data.precioGalon !== undefined
    ) {
      formData.append(
        'precio_galon',
        String(data.precioGalon)
      );
    }

    formData.append(
      'tipo_combustible',
      data.tipoCombustible || 'DIESEL'
    );

    if (data.estacion) {
      formData.append(
        'estacion',
        data.estacion
      );
    }

    if (data.numeroFactura) {
      formData.append(
        'numero_factura',
        data.numeroFactura
      );
    }

    if (
      data.kmActual !== null
      && data.kmActual !== undefined
    ) {
      formData.append(
        'km_actual',
        String(data.kmActual)
      );
    }

    if (
      data.horometroActual !== null
      && data.horometroActual !== undefined
    ) {
      formData.append(
        'horometro_actual',
        String(data.horometroActual)
      );
    }

    formData.append(
      'archivo',
      data.archivo
    );

    if (data.observaciones) {
      formData.append(
        'observaciones',
        data.observaciones
      );
    }

    return this.http.post<Tanqueo>(
      this.apiUrl,
      formData
    );
  }

  // =========================================================
  // CONSULTAS OPERADOR
  // =========================================================

  obtenerMisTanqueos(
    filtros: FiltrosTanqueo = {}
  ): Observable<Tanqueo[]> {
    return this.http.get<Tanqueo[]>(
      `${this.apiUrl}/mis-tanqueos`,
      { params: this.construirParams(filtros) }
    );
  }

  obtenerMisMetricas(
    filtros: FiltrosTanqueo = {}
  ): Observable<MetricasTanqueo> {
    return this.http.get<MetricasTanqueo>(
      `${this.apiUrl}/mis-metricas`,
      { params: this.construirParams(filtros) }
    );
  }

  // =========================================================
  // CONSULTAS ADMINISTRATIVAS
  // =========================================================

  listarTanqueos(
    filtros: FiltrosTanqueo = {}
  ): Observable<Tanqueo[]> {
    return this.http.get<Tanqueo[]>(
      this.apiUrl,
      { params: this.construirParams(filtros) }
    );
  }

  obtenerMetricas(
    filtros: FiltrosTanqueo = {}
  ): Observable<MetricasTanqueo> {
    return this.http.get<MetricasTanqueo>(
      `${this.apiUrl}/metricas`,
      { params: this.construirParams(filtros) }
    );
  }

  validar(id: number): Observable<Tanqueo> {
    return this.http.put<Tanqueo>(
      `${this.apiUrl}/${id}/validar`,
      {}
    );
  }

  rechazar(
    id: number,
    observacion?: string
  ): Observable<Tanqueo> {
    return this.http.put<Tanqueo>(
      `${this.apiUrl}/${id}/rechazar`,
      { observacion: observacion || null }
    );
  }

  // =========================================================
  // URL DE IMAGEN
  // =========================================================

  urlArchivo(path?: string): string | null {
    if (!path) {
      return null;
    }

    return `${environment.apiUrl}/uploads/${path}`;
  }

  // =========================================================
  // PARAMS
  // =========================================================

  private construirParams(
    filtros: FiltrosTanqueo
  ): HttpParams {
    let params = new HttpParams();

    Object.keys(filtros).forEach((key) => {
      const valor = (filtros as any)[key];

      if (
        valor !== null
        && valor !== undefined
        && valor !== ''
      ) {
        params = params.set(
          key,
          String(valor)
        );
      }
    });

    return params;
  }
}
