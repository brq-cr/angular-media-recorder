import { Component, OnInit } from '@angular/core';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'media-record',
  template: `
    <button (click)="onStartStop" type="button">{{isRecording ? 'Stop' : 'Record'}}</button>
    <div class="audio"></div>
  `,
  styles: [`h1 { font-family: Lato; }`],
})
export class MediaRecordComponent implements OnInit {
  constraints = {
    audio: true,
    video: false,
  };
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder
  // Codecs: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter
  options = {
    type: 'audio/ogg',
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
    const blobUrl = URL.createObjectURL(audioBlob);
    const audio = document.createElement('audio');
    audio.setAttribute('src', blobUrl);
    audio.setAttribute('controls', '');
    document.append(audio);

    let a = document.createElement('a');
    a.setAttribute('href', blobUrl);
    a.setAttribute('download', `recording-${new Date().toISOString()}.oga`);
    a.innerText = 'Download';
    document.append(a);

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
