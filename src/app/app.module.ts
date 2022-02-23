import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StopwatchComponent } from './stopwatch/stopwatch.component';
import { NotesComponent } from './notes/notes.component';
import { ReactiveFormsModule } from '@angular/forms';
import { YoutubePipe } from './youtube.pipe';

@NgModule({
  declarations: [
    AppComponent,
    StopwatchComponent,
    NotesComponent,
    YoutubePipe,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
