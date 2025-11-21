import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Socio } from './socios/socios.component';
import { Pago } from './pagos/pagos.component'

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private baseUrl = 'https://localhost:7140/api';

  constructor(private http: HttpClient) { }

  getSocios(): Observable<Socio[]> {
    return this.http.get<Socio[]>(`${this.baseUrl}/socios`);
  }

  getSocio(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/socios/${id}`);
  }

  getTodosLosSocios(): Observable<Socio[]> {
    return this.http.get<Socio[]>(`${this.baseUrl}/socios/todos`);
  }

  buscarSocios(query: string): Observable<Socio[]> {
    return this.http.get<Socio[]>(`${this.baseUrl}/socios/buscar?query=${query}`);
  }

  addSocio(socio: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/socios`, socio);
  }

  deleteSocio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/socios/${id}`);
  }

  crearSocio(formData: FormData): Observable<Socio> {
    return this.http.post<Socio>(`${this.baseUrl}/socios`, formData);
  }

  updateSocio(id: number, socio: Partial<Socio>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/socios/${id}`, socio);
  }

  getPagosPorSocio(socioID: number): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${this.baseUrl}/pagos/${socioID}`);
  }

  registrarPago(socioID: number, pago: Pago): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/pagos/${socioID}`, pago);
  }

  updatePago(pagoID: number, pago: Partial<Pago>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/pagos/${pagoID}`, pago);
  }

  deletePago(pagoID: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/pagos/${pagoID}`);
  }


}