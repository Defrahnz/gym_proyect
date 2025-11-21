import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { debounceTime, Subject } from 'rxjs';
import { AppService } from '../app.module';

// Modelo de socio (igual que en socios)
export interface Socio {
  socioID: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  alCorriente: boolean;
  fechaPago?: string
}

// Modelo de pago (con nombres que coinciden con el backend)
export interface Pago {
  fechaPago: string;
  monto: number;
  metodoPago: string;
  alCorriente: boolean;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})
export class PagosComponent implements OnInit {
  socios: Socio[] = [];
  terminoBusqueda = '';
  private busquedaSubject = new Subject<string>();

  // Modal de pagos
  modalPagosVisible = false;
  socioConPagos: Socio | null = null;
  historialPagos: Pago[] = [];
  ultimoPago: Pago | null = null;
  nuevoPago: Partial<Pago> = {
    fechaPago: '',
    monto: 0,
    metodoPago: '',
    alCorriente: false
  };

  hoy: string = new Date().toISOString().split('T')[0];

  constructor(private appService: AppService, private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarSocios();

    // Buscador con debounce
    this.busquedaSubject.pipe(
      debounceTime(300)
    ).subscribe(query => {
      const limpio = query.trim();
      if (limpio === '') {
        this.cargarSocios();
      } else {
        this.appService.buscarSocios(limpio)
          .subscribe(result => this.socios = result);
      }
    });
  }

  onBusquedaChange(valor: string) {
    this.busquedaSubject.next(valor);
  }

  cargarSocios(): void {
    this.appService.getSocios().subscribe({
      next: (data) => this.socios = data,
      error: (err) => console.error('Error al cargar socios:', err)
    });
  }

  // Abrir modal de pagos
  abrirModalPagos(socio: Socio): void {
    this.socioConPagos = socio;
    this.modalPagosVisible = true;
    document.body.classList.add('modal-open');

    // Cargar historial de pagos desde el backend
    this.appService.getPagosPorSocio(socio.socioID).subscribe({
      next: (pagos) => {
        this.historialPagos = pagos;
        this.ultimoPago = pagos.length > 0 ? pagos[pagos.length - 1] : null;
      },
      error: (err) => console.error('Error al cargar pagos:', err)
    });
  }

  cerrarModalPagos(): void {
    this.modalPagosVisible = false;
    this.socioConPagos = null;
    this.historialPagos = [];
    this.ultimoPago = null;
    this.nuevoPago = {
      fechaPago: '',
      monto: 0,
      metodoPago: '',
      alCorriente: false
    };
    document.body.classList.remove('modal-open');
  }

  confirmarPago(): void {
  if (!this.socioConPagos || !this.nuevoPago.fechaPago || !this.nuevoPago.monto || !this.nuevoPago.metodoPago) {
    return;
  }
  // Validacion de calendario

  const fechaSeleccionada = new Date(this.nuevoPago.fechaPago);
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  if(fechaSeleccionada > hoy){
    alert("La fecha de pago no puede ser posterior a hoy.");
    return;
  }

  const pago: Pago = {
    fechaPago: this.nuevoPago.fechaPago,
    monto: this.nuevoPago.monto,
    metodoPago: this.nuevoPago.metodoPago,
    alCorriente: true 
  };

  this.appService.registrarPago(this.socioConPagos.socioID, pago).subscribe({
    next: () => {
      // Recargar historial de pagos del socio
      this.appService.getPagosPorSocio(this.socioConPagos!.socioID).subscribe({
        next: (pagos) => {
          this.historialPagos = pagos;
          this.ultimoPago = pagos.length > 0 ? pagos[pagos.length - 1] : null;
        }
      });

      // Recargar lista de socios para reflejar cambios en la tabla de Pagos
      this.cargarSocios();

      // Reset del formulario
      this.nuevoPago = {
        fechaPago: '',
        monto: 0,
        metodoPago: '',
        alCorriente: false
      };

      console.log('Pago registrado correctamente');
    },
    error: (err) => console.error('Error al registrar pago:', err)
  });
}
}