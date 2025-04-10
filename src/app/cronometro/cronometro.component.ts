import { Component, signal, computed, effect, Inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { Medicion } from '../model/Medicion';
import { MatListModule } from '@angular/material/list';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cronometro',
  templateUrl: './cronometro.component.html',
  styleUrls: ['./cronometro.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    MatListModule,
  ],
  animations: [
    trigger('minutoAnimado', [
      state('normal', style({ transform: 'translateY(0)' })),
      state('nuevo', style({ transform: 'translateY(0)' })),
      transition('normal => nuevo', [
        style({ transform: 'translateY(100%)' }),
        animate('0.5s ease-out', style({ transform: 'translateY(0)' })),
      ]),
      transition('nuevo => normal', [
        animate('0.5s ease-in', style({ transform: 'translateY(-100%)' })),
      ]),
    ]),
  ],
})
export class CronometroComponent {
  tiempo = signal(0);
  corriendo = signal(false);
  intervalo: any;
  minutoActual = signal(0);
  animacionEstado = signal('normal');
  mediciones = signal<Medicion[]>([]);
  cargando = signal(true);
  private tiempoInicio: number | null = null; // Tiempo de inicio en milisegundos

  tiempoFormateado = computed(() => {
    const horas = Math.floor(this.tiempo() / 3600000);
    const minutos = Math.floor((this.tiempo() % 3600000) / 60000);
    const segundos = Math.floor((this.tiempo() % 60000) / 1000);
    const milisegundos = Math.floor((this.tiempo() % 1000) / 10);
    return `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}.${this.pad(
      milisegundos
    )}`;
  });

  constructor(private dialog: MatDialog, private http: HttpClient) {
    this.cargarHistorial();
    setTimeout(() => {
      this.cargando.set(false);
    }, 5000);
    effect(() => {
      const nuevoMinuto = Math.floor(this.tiempo() / 60000);
      if (nuevoMinuto !== this.minutoActual()) {
        this.minutoActual.set(nuevoMinuto);
        this.animacionEstado.set('nuevo');
        setTimeout(() => this.animacionEstado.set('normal'), 500);
      }
    });
  }

  ngOnInit() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  // Manejo del cambio de visibilidad
  onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      if (this.corriendo() && this.tiempoInicio !== null) {
        // Recalcula el tiempo transcurrido al volver a la pestaña
        const tiempoTranscurrido = Date.now() - this.tiempoInicio;
        this.tiempo.set(tiempoTranscurrido);
        this.iniciarActualizacion(); // Reanuda la actualización
      }
    } else {
      // Al salir de la pestaña, pausa la actualización pero conserva tiempoInicio
      if (this.corriendo()) {
        clearInterval(this.intervalo);
      }
    }
  };

  // Método para iniciar la actualización del tiempo
  private iniciarActualizacion() {
    this.intervalo = setInterval(() => {
      if (this.tiempoInicio !== null) {
        this.tiempo.set(Date.now() - this.tiempoInicio);
      }
    }, 10);
  }

  // Iniciar o pausar el cronómetro
  iniciarPausar() {
    if (this.corriendo()) {
      clearInterval(this.intervalo);
      this.tiempo.set(Date.now() - this.tiempoInicio!); // Guarda el tiempo acumulado
      this.tiempoInicio = null; // Resetea el tiempo de inicio
      this.corriendo.set(false);
    } else {
      if (this.tiempo() === 0) {
        this.tiempoInicio = Date.now(); // Nuevo inicio desde cero
      } else {
        this.tiempoInicio = Date.now() - this.tiempo(); // Continúa desde el tiempo acumulado
      }
      this.corriendo.set(true);
      this.iniciarActualizacion(); // Comienza la actualización
    }
  }

  // Reiniciar el cronómetro
  reiniciar() {
    clearInterval(this.intervalo);
    this.tiempo.set(0);
    this.corriendo.set(false);
    this.tiempoInicio = null; // Resetea el tiempo de inicio
    this.minutoActual.set(0);
  }

  // Formatear tiempo para historial
  formatearTiempoHistorial(tiempoMs: number): string {
    const horas = Math.floor(tiempoMs / 3600000);
    const minutos = Math.floor((tiempoMs % 3600000) / 60000);
    const segundos = Math.floor((tiempoMs % 60000) / 1000);
    return `${this.pad(horas)}:${this.pad(minutos)}:${this.pad(segundos)}`;
  }

  // Cargar historial desde la API
  cargarHistorial() {
    this.http.get<Medicion[]>('/api/historial').subscribe({
      next: (historial) => {
        this.mediciones.set(historial);
        this.cargando.set(false);
      },
      error: (err) => console.error('Error cargando historial:', err),
    });
  }

  // Formatear números con ceros a la izquierda
  pad(numero: number): string {
    return numero < 10 ? `0${numero}` : numero.toString();
  }

  // Limpiar al destruir el componente
  ngOnDestroy() {
    clearInterval(this.intervalo);
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  // Guardar una nueva medición
  guardar() {
    const nuevaMedicion: Medicion = {
      tiempo: this.tiempo(),
      fecha: new Date().toISOString(),
    };
    this.http.post<Medicion>('/api/historial', nuevaMedicion).subscribe({
      next: () => this.mediciones.update((h) => [...h, nuevaMedicion]),
      error: (err: any) => console.error('Error guardando:', err),
    });
  }

  // Borrar una medición
  borrarMedicion(index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: '¿Seguro que querés borrar esta medición?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.http.delete('/api/historial', { body: { index } }).subscribe({
          next: () =>
            this.mediciones.update((h) => h.filter((_, i) => i !== index)),
          error: (err) => console.error('Error borrando:', err),
        });
      }
    });
  }
}

@Component({
  template: `
    <h2 mat-dialog-title>Confirmar</h2>
    <mat-dialog-content>{{ data.mensaje }}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close(false)">Cancelar</button>
      <button mat-button color="warn" (click)="dialogRef.close(true)">
        Borrar
      </button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule],
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mensaje: string }
  ) {}
}