import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {
  meses: string[] = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];
  mesSeleccionado: string = 'Noviembre';

  // Datos inventados
  sociosInscritos = [50, 60, 55, 70, 65, 80, 75, 90, 85, 95, 100, 110];
  ingresos = [5000, 6000, 5500, 7000, 6500, 8000, 7500, 9000, 8500, 9500, 10000, 11000];
  morosos1Mes = 20;
  morosos3Meses = 10;
  recurrentes = 120;
  nuevos = 40;

  constructor() {}

  ngOnInit(): void {
    this.renderGraficaSocios();
    this.renderGraficaIngresos();
    this.renderGraficaMorosos();
    this.renderGraficaRecurrentes();
  }

  renderGraficaSocios(): void {
    const ctx = document.getElementById('graficaSocios') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.meses,
        datasets: [{
          label: 'Socios inscritos',
          data: this.sociosInscritos,
          backgroundColor: '#0d6efd'
        }]
      }
    });
  }

  renderGraficaIngresos(): void {
    const ctx = document.getElementById('graficaIngresos') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.meses,
        datasets: [{
          label: 'Ingresos ($)',
          data: this.ingresos,
          backgroundColor: '#198754'
        }]
      }
    });
  }

  renderGraficaMorosos(): void {
    const ctx = document.getElementById('graficaMorosos') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Morosos 1 mes', 'Morosos 3 meses'],
        datasets: [{
          data: [this.morosos1Mes, this.morosos3Meses],
          backgroundColor: ['#ffc107', '#dc3545']
        }]
      }
    });
  }

  renderGraficaRecurrentes(): void {
    const ctx = document.getElementById('graficaRecurrentes') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Recurrentes', 'Nuevos'],
        datasets: [{
          data: [this.recurrentes, this.nuevos],
          backgroundColor: ['#0dcaf0', '#6c757d']
        }]
      }
    });
  }
}