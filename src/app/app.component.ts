import { Component } from '@angular/core';
import { CronometroComponent } from './cronometro/cronometro.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CronometroComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ositrometro';
}
