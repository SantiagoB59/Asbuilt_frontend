import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PreoperacionalService {

  private apiUrl = `${environment.apiUrl}/api/inspecciones`;

  constructor(
    private http: HttpClient
  ) { }

  // ===========================
  // ACTIVOS DISPONIBLES
  // ===========================

  obtenerMisActivos(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/mis-activos`
    );

  }

  // ===========================
  // PLANTILLA DEL OPERADOR / ADMIN
  // ===========================

  obtenerMiPlantilla(
    tipoActivo?: string,
    activoId?: number | string
  ): Observable<any> {

    let params = new HttpParams();

    if (tipoActivo && activoId != null) {
      params = params
        .set('tipo_activo', tipoActivo)
        .set('activo_id', String(activoId));
    }

    return this.http.get(
      `${this.apiUrl}/mi-plantilla`,
      { params }
    );

  }

  // ===========================
  // INICIAR INSPECCIÓN
  // ===========================

  iniciarInspeccion(
    tipoActivo?: string,
    activoId?: number | string
  ): Observable<any> {

    const body: any = {};

    if (tipoActivo && activoId != null) {
      body.tipo_activo = tipoActivo;
      body.activo_id = activoId;
    }

    return this.http.post(
      `${this.apiUrl}/iniciar`,
      body
    );

  }

  // ===========================
  // OBTENER INSPECCIÓN
  // ===========================

  obtenerInspeccion(
    id: number
  ): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/${id}`
    );

  }

  // ===========================
  // GUARDAR RESPUESTA
  // ===========================

  guardarRespuesta(
    inspeccionId: number,
    respuesta: any
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${inspeccionId}/respuesta`,
      respuesta
    );

  }

  // ===========================
  // SUBIR FOTO
  // ===========================

  subirFoto(
    respuestaId: number,
    archivo: File,
    observacion?: string
  ): Observable<any> {

    const formData = new FormData();

    formData.append('foto', archivo);

    if (observacion) {
      formData.append('observacion', observacion);
    }

    return this.http.post(
      `${this.apiUrl}/respuesta/${respuestaId}/foto`,
      formData
    );

  }

  // ===========================
  // FINALIZAR
  // ===========================

  finalizarInspeccion(
    inspeccionId: number
  ): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/${inspeccionId}/finalizar`,
      {}
    );

  }

  // ===========================
  // ANOMALÍAS
  // ===========================

  crearAnomalia(data: any): Observable<any> {

    return this.http.post(
      `${this.apiUrl}/anomalias`,
      data
    );

  }

  listarAnomalias(): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/anomalias`
    );

  }

  obtenerAnomalia(id: number): Observable<any> {

    return this.http.get(
      `${this.apiUrl}/anomalias/${id}`
    );

  }

  actualizarAnomalia(
    id: number,
    data: any
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/anomalias/${id}`,
      data
    );

  }

  cambiarEstadoAnomalia(
    id: number,
    estado: string
  ): Observable<any> {

    return this.http.put(
      `${this.apiUrl}/anomalias/${id}/estado`,
      {
        estado
      }
    );

  }

  subirFotoAnomalia(
    anomaliaId: number,
    archivo: File
  ): Observable<any> {

    const formData = new FormData();

    formData.append('foto', archivo);

    return this.http.post(
      `${this.apiUrl}/anomalias/${anomaliaId}/foto`,
      formData
    );

  }

  eliminarAnomalia(id: number): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/anomalias/${id}`
    );

  }


  // ===========================
  // DESCARGAR PDF
  // ===========================

  descargarPDF(
    id: number
  ) {

    return this.http.get(
      `${this.apiUrl}/${id}/pdf`,
      {
        responseType: 'blob'
      }
    );

  }


  // ===========================
  // LISTADO ADMINISTRATIVO
  // ===========================


  listarInspeccionesAdmin(filtros: any) {

  let params: any = {};

  if (filtros.fecha_inicio) {
    params.fecha_inicio = filtros.fecha_inicio;
  }

  if (filtros.fecha_fin) {
    params.fecha_fin = filtros.fecha_fin;
  }

  if (filtros.usuario_id) {
    params.usuario_id = filtros.usuario_id;
  }

  if (filtros.vehiculo_id) {
    params.vehiculo_id = filtros.vehiculo_id;
  }

  if (filtros.maquinaria_id) {
    params.maquinaria_id = filtros.maquinaria_id;
  }

  if (filtros.estado) {
    params.estado = filtros.estado;
  }

    return this.http.get<any>(
      `${this.apiUrl}/admin/listar`,
      {
        params
      }
    );

}
  

// ==========================================
// GUARDAR LECTURA INICIAL
// ==========================================

guardarLecturaInicial(
  inspeccionId: number,
  lectura: number,
  foto: File
): Observable<any> {

  const formData = new FormData();

  formData.append(
    'lectura',
    lectura.toString()
  );

  formData.append(
    'foto',
    foto,
    foto.name
  );

  return this.http.post(
    `${this.apiUrl}/${inspeccionId}/lectura-inicial`,
    formData
  );

}

// ==========================================
// GUARDAR LECTURA FINAL + FIRMA
// ==========================================

guardarLecturaFinal(
  inspeccionId: number,
  lectura: number,
  foto: File,
  firma: File,
  tratamientoDatosAceptado: boolean,
  confirmaFirma: boolean
): Observable<any> {

  const formData = new FormData();

  formData.append(
    'lectura',
    lectura.toString()
  );

  formData.append(
    'foto',
    foto,
    foto.name
  );

  formData.append(
    'firma',
    firma,
    firma.name
  );

  formData.append(
    'tratamiento_datos_aceptado',
    tratamientoDatosAceptado ? 'true' : 'false'
  );

  formData.append(
    'confirma_firma',
    confirmaFirma ? 'true' : 'false'
  );

  return this.http.post(
    `${this.apiUrl}/${inspeccionId}/lectura-final`,
    formData
  );
}

}