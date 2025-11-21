import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppService } from '../app.module';
import { debounceTime, Subject } from 'rxjs';
import { RouterModule } from '@angular/router';

export interface Socio {
  socioID: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaRegistro: string;
  activoInactivo: boolean;
  email: string;
  fechaBaja?: string;
  fechaPago?: string;
  alCorriente: boolean;
  fotoUrl: string;
}

@Component({
  selector: 'app-socios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './socios.component.html',
  styleUrls: ['./socios.component.css']
})
export class SociosComponent implements OnInit {
  socios: Socio[] = [];
  nuevoSocio: Partial<Socio> = {};
  modalVisible: boolean = false;
  socioSeleccionado: Socio | null = null;
  modalConfirmarVisible: boolean = false;
  modalDeshabilitadosVisible: boolean = false;
  modalConfirmarHabilitarVisible: boolean = false;
  sociosDeshabilitados: Socio[] = [];
  socioAReactivar: Socio | null = null;
  fotoSeleccionada: File | null = null;
  modalFotoVisible = false;
  socioConFoto: Socio | null = null;
  terminoBusqueda: string = '';
  private busquedaSubject = new Subject<string>();

  constructor(private appService: AppService, private http: HttpClient) {

  }

  ngOnInit(): void {
    this.cargarSocios();
    this.busquedaSubject.pipe(
      debounceTime(300)
    ).subscribe(query =>{
      const limpio = query.trim();
      if(limpio===''){
        this.cargarSocios();
      }else{
        this.appService.buscarSocios(limpio)
        .subscribe(result => this.socios = result);
      }
    });
  }

  onBusquedaChange(valor: string){
    this.busquedaSubject.next(valor);
  }


  cargarSocios(): void {
    this.appService.getSocios().subscribe({
      next: (data) => this.socios = data,
      error: (err) => console.error('Error al cargar socios:', err)
    });
  }

  openNuevoSocioModal(): void {
    this.nuevoSocio = {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      activoInactivo: true
    };
    this.modalVisible = true;
    document.body.classList.add('modal-open');
  }

  cerrarModal(): void {
    this.modalVisible = false;
    document.body.classList.remove('modal-open');
  }

  //Guardar nuevo Socio

  guardarNuevoSocio(): void {
    const formData = new FormData();

    formData.append('nombre', this.nuevoSocio.nombre ?? '');
    formData.append('apellidoPaterno', this.nuevoSocio.apellidoPaterno ?? '');
    formData.append('apellidoMaterno', this.nuevoSocio.apellidoMaterno ?? '');
    formData.append('email', this.nuevoSocio.email ?? '');

    if (this.fotoSeleccionada) {
      formData.append('foto', this.fotoSeleccionada);
    }

    this.appService.crearSocio(formData).subscribe({
      next: (socioCreado) => {
        this.socios.push(socioCreado);
        this.cerrarModal();
      },
      error: (err) => console.error('Error al crear socio', err)
    });
  }

  onFotoSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fotoSeleccionada = input.files[0];
    }
  }


  deshabilitarSocio(socio: Socio): void {
    console.log('Deshabilitar socio:', socio);
  }

  abrirModalConfirmar(socio: Socio): void {
    this.socioSeleccionado = socio;
    this.modalConfirmarVisible = true;
    document.body.classList.add('modal-open');
  }

  cerrarModalConfirmar(): void {
    this.modalConfirmarVisible = false;
    this.socioSeleccionado = null;
    document.body.classList.remove('modal-open');
  }

  // Socios deshabilitar

  confirmarDeshabilitar(): void {
    if (!this.socioSeleccionado) return;

    const hoy = new Date();
    const fechaLocal = hoy.toLocaleDateString('en-CA');

    this.appService.updateSocio(this.socioSeleccionado.socioID, {
      ...this.socioSeleccionado,
      activoInactivo: false,
      fechaBaja: fechaLocal
    }).subscribe({
      next: () => {
        this.cargarSocios();
        this.cerrarModalConfirmar();
      },
      error: (err) => console.error('Error al deshabilitar socio:', err)
    });
  }


  abrirModalDeshabilitados(): void {
    this.appService.getTodosLosSocios().subscribe({
      next: (data) => {
        console.log('Todos los socios:', data);
        this.sociosDeshabilitados = data.filter(s => s.activoInactivo === false);
        this.modalDeshabilitadosVisible = true;
        document.body.classList.add('modal-open');
      },
      error: (err) => console.error('Error al cargar deshabilitados:', err)
    });
  }

  cerrarModalDeshabilitados(): void {
    this.modalDeshabilitadosVisible = false;
    document.body.classList.remove('modal-open');
  }

  //Habilitar Socios

  abrirConfirmarHabilitar(socio: Socio): void {
    this.socioAReactivar = socio;
    this.modalConfirmarHabilitarVisible = true;
  }

  cerrarConfirmarHabilitar(): void {
    this.modalConfirmarHabilitarVisible = false;
    this.socioAReactivar = null;
  }

  confirmarHabilitar(): void {
    if (!this.socioAReactivar) return;

    const hoy = new Date();
    const fechaLocal = hoy.toLocaleDateString('en-CA');

    const actualizado: Partial<Socio> = {
      ...this.socioAReactivar,
      activoInactivo: true,
      fechaRegistro: fechaLocal,
      fechaBaja: undefined
    };

    this.appService.updateSocio(this.socioAReactivar.socioID, actualizado).subscribe({
      next: () => {
        this.cargarSocios();
        this.sociosDeshabilitados = this.sociosDeshabilitados.filter(s => s.socioID !== this.socioAReactivar?.socioID);
        this.cerrarConfirmarHabilitar();
      },
      error: (err) => console.error('Error al habilitar socio:', err)
    });
  }

  //Editar Socio

  modalEditarVisible = false;
  socioEditado: Partial<Socio> | null = null;

  abrirModalEditar(socio: Socio): void {
    this.socioEditado = { ...socio };
    this.modalEditarVisible = true;
  }

  cerrarModalEditar(): void {
    this.modalEditarVisible = false;
    this.socioEditado = null;
  }

  confirmarEditar(): void {
    if (!this.socioEditado || !this.socioEditado.socioID) return;

    this.appService.updateSocio(this.socioEditado.socioID, this.socioEditado).subscribe({
      next: () => {
        this.cargarSocios();
        this.cerrarModalEditar();
      },
      error: (err) => console.error('Error al editar socio:', err)
    });
  }

  //Ver foto en grande

  abrirModalFoto(socio: Socio): void {
    this.socioConFoto = socio;
    this.modalFotoVisible = true;
  }

  cerrarModalFoto(): void {
    this.modalFotoVisible = false;
    this.socioConFoto = null;
  }



}