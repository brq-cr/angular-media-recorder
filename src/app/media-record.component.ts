import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'media-record',
  template: `
    <button (click)="onStartStop()" type="button">{{isRecording ? 'Stop' : 'Record'}}</button>
    <div #audioContainer ></div>
  `,
  styles: [`h1 { font-family: Lato; }`],
})
export class MediaRecordComponent implements OnInit {
  @ViewChild('audioContainer') audioContainer: ElementRef;
  constraints = {
    audio: true,
    video: false,
  };
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder
  // Codecs: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter

  // MP3 = audio/mpeg
  // OGG - Vorbis = audio/ogg; codecs=vorbis
  options = {
    type: 'audio/ogg; codecs=vorbis',
  };
  mediaRecorderInstance: MediaRecorder = null;
  audioChunks: Blob[] = [];
  isRecording: Boolean = false;

  ngOnInit() {
    this.askBrowserPermitions$().subscribe((stream) => {
      this.mediaRecorderInstance = new MediaRecorder(stream);
      this.mediaRecorderInstance.addEventListener('dataavailable', (event) => {
        this.audioChunks.push(event.data);
      });
      this.mediaRecorderInstance.addEventListener('stop', () => {
        this.saveRecordToFile(new Blob(this.audioChunks, this.options));
      });
    });
  }

  private askBrowserPermitions$(): Observable<MediaStream> {
    return from(navigator.mediaDevices.getUserMedia(this.constraints));
  }

  private saveRecordToFile(audioBlob: Blob) {
    const url = window.URL.createObjectURL(audioBlob);
    window.open(url);
    // Clean Audio
    this.audioChunks = [];
  }

  private startRecording() {
    this.mediaRecorderInstance.start();
  }

  private stopRecording() {
    this.mediaRecorderInstance.stop();
  }

  onStartStop() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
    this.isRecording = !this.isRecording;
  }
}
