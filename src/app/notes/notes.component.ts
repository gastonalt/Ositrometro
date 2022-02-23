import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {

  notas: any[] = [];
  formNota: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
      this.formNota = this.fb.group({
        nota: ['', Validators.required]
      });
  }

  agregar($event: any){
      $event.preventDefault();
      console.log(this.formNota.controls['nota'].value)
      const nota = this.formNota.controls['nota'].value;
      this.notas.unshift(nota);
      this.formNota.reset()
  }

  clearNotas(){
    this.notas = [];
  }

}
