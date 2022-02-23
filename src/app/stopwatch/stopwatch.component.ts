import { Component, OnInit, Pipe, SecurityContext } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { timer } from 'rxjs';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.scss']
})

export class StopwatchComponent implements OnInit {


  formUrl: FormGroup;

  constructor(private fb: FormBuilder, private sanitizer: DomSanitizer) { }

  urlVideoYT: string = 'https://www.youtube.com/watch?v=BQrxsyGTztM&ab_channel=AmbientWorlds';
  time = 0;
  timerDisplay = {
    hours: {digit1: '0', digit2: '0'},
    minutes: {digit1: '0', digit2: '0'},
    seconds: {digit1: '0', digit2: '0'}
  }
  isRunning: boolean = false;
  btnText = 'bi bi-play-fill';
  dPath = 'm11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z';

  ngOnInit(): void {
    this.urlYTVideo(this.urlVideoYT)
    this.formUrl = this.fb.group({
      url: ['', Validators.required]
    });
    timer(0, 1000).subscribe(ec => {
      if(this.isRunning){
        this.time++;
      }
      this.timerDisplay = this.getDisplayTimer(this.time);
    });
    console.log(this.timerDisplay)
  }

  setUrl($event: any){
    $event.preventDefault();
    const url =this.formUrl.controls['url'].value;
    this.urlYTVideo(url)
  }

  urlYTVideo(url: any){
    let urlNueva = url;
    // https://www.youtube.com/watch?v=49IwceBjeck&list=PLjDkdEzwx_1AAzvQe8UHhlDS6h6S7e2EV&index=3&ab_channel=LeoUehara
    urlNueva = url.split('watch?v=')[1]
    this.urlVideoYT = 'https://www.youtube.com/embed/' +  urlNueva.split('&')[0];
  }

  toggleTimer() {
    this.isRunning = !this.isRunning;
    if(this.isRunning){
      this.btnText = 'bi bi-pause-fill';
      this.dPath = 'M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z';
    }else{
      this.btnText = 'bi bi-play-fill';
      this.dPath = 'm11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z';
    }
  }

  getDisplayTimer(time: number) {
    const hours = '0' + Math.floor(time / 3600);
    const minutes = '0' + Math.floor(time % 3600 / 60);
    const seconds = '0' + Math.floor(time % 3600 % 60);

    return {
      hours: { digit1: hours.slice(-2, -1), digit2: hours.slice(-1) },
      minutes: { digit1: minutes.slice(-2, -1), digit2: minutes.slice(-1) },
      seconds: { digit1: seconds.slice(-2, -1), digit2: seconds.slice(-1) },
    };
  }



}
