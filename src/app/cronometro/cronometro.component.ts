import {
  Component,
  signal,
  computed,
  effect,
  Inject,
} from '@angular/core';
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

  tiempoFormateado = computed(() => {
    const minutos = Math.floor(this.tiempo() / 60000);
    const segundos = Math.floor((this.tiempo() % 60000) / 1000);
    const milisegundos = Math.floor((this.tiempo() % 1000) / 10);
    return `${this.pad(minutos)}:${this.pad(segundos)}.${this.pad(
      milisegundos
    )}`;
  });

  constructor(private dialog: MatDialog, private http: HttpClient) {
    this.cargarHistorial();
    effect(() => {
      const nuevoMinuto = Math.floor(this.tiempo() / 60000);
      if (nuevoMinuto !== this.minutoActual()) {
        this.minutoActual.set(nuevoMinuto);
        this.animacionEstado.set('nuevo');
        setTimeout(() => this.animacionEstado.set('normal'), 500);
      }
    });
  }

  formatearTiempoHistorial(tiempoMs: number): string {
    const minutos = Math.floor(tiempoMs / 60000);
    const segundos = Math.floor((tiempoMs % 60000) / 1000);
    return `${this.pad(minutos)}:${this.pad(segundos)}`;
  }

  cargarHistorial() {
    this.http.get<Medicion[]>('/api/historial').subscribe({
      next: (historial) => this.mediciones.set(historial),
      error: (err) => console.error('Error cargando historial:', err),
    });
  }

  iniciarPausar() {
    if (this.corriendo()) {
      clearInterval(this.intervalo);
    } else {
      this.intervalo = setInterval(() => {
        this.tiempo.update((t) => t + 10);
      }, 10);
    }
    this.corriendo.set(!this.corriendo());
  }

  reiniciar() {
    clearInterval(this.intervalo);
    this.tiempo.set(0);
    this.corriendo.set(false);
    this.minutoActual.set(0);
  }

  pad(numero: number): string {
    return numero < 10 ? `0${numero}` : numero.toString();
  }

  ngOnDestroy() {
    clearInterval(this.intervalo);
  }

  guardar() {
    const nuevaMedicion: Medicion = {
      tiempo: this.tiempo(),
      fecha: new Date().toISOString(),
    };
    this.http.post<Medicion>('/api/historial', nuevaMedicion).subscribe({
      next: () => this.mediciones.update(h => [...h, nuevaMedicion]),
      error: (err: any) => console.error('Error guardando:', err)
    });
  }

  borrarMedicion(index: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { mensaje: '¿Seguro que querés borrar esta medición?' },
    });

    dialogRef.afterClosed().subscribe(result => {
      // if (result) {
      //   this.http.delete('/api/historial', { body: { index } }).subscribe({
      //     next: () => this.mediciones.update(h => h.filter((_, i) => i !== index)),
      //     error: (err) => console.error('Error borrando:', err)
      //   });
      //}
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
