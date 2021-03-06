import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'media-record',
  template: `
    <button (click)="onStartStop()" type="button">{{isRecording ? 'Stop' : 'Record'}}</button>
    <div #audioContainer ></div>
  `,
  styles: [`h1 { font-family: Lato; }`],
})
export class MediaRecordComponent {
  @ViewChild('audioContainer') audioContainer: ElementRef;
  private constraints = {
    audio: true,
    video: false,
  };
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder
  // Codecs: https://developer.mozilla.org/en-US/docs/Web/Media/Formats/codecs_parameter

  // MP3 = audio/mpeg
  // OGG = audio/ogg; codecs=vorbis
  private options = {
    type: 'audio/ogg; codecs=opus',
  };
  private mediaRecorderInstance: any = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream = null;
  public isRecording: Boolean = false;

  constructor(private renderer2: Renderer2) {}

  private getAudioStream$(): Observable<MediaStream> {
    return from(navigator.mediaDevices.getUserMedia(this.constraints));
  }

  private saveRecordToFile(audioBlob: Blob) {
    const audioURL = window.URL.createObjectURL(audioBlob);
    console.log(audioURL);
    const audioControl = this.renderer2.createElement('audio');
    this.renderer2.setAttribute(audioControl, 'src', audioURL);
    this.renderer2.setAttribute(audioControl, 'controls', '');
    this.renderer2.appendChild(this.audioContainer.nativeElement, audioControl);
    // Clean Audio
    this.audioChunks = [];
  }

  private startRecording() {
    let workerOptions = {
      OggOpusEncoderWasmPath:
        'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/OggOpusEncoder.wasm',
      WebMOpusEncoderWasmPath:
        'https://cdn.jsdelivr.net/npm/opus-media-recorder@latest/WebMOpusEncoder.wasm',
    };
    this.getAudioStream$().subscribe((mediaStream) => {
      this.stream = mediaStream;
      // @ts-ignore
      this.mediaRecorderInstance = new OpusMediaRecorder(
        this.stream,
        { mimeType: 'audio/ogg' },
        workerOptions
      );
      this.mediaRecorderInstance.addEventListener('stop', () => {
        this.saveRecordToFile(new Blob(this.audioChunks, this.options));
      });
      this.mediaRecorderInstance.addEventListener('dataavailable', (event) => {
        this.audioChunks.push(event.data);
      });
      this.mediaRecorderInstance.start();
    });
  }

  private stopRecording() {
    this.mediaRecorderInstance.stop();
    this.stream.getTracks().forEach((track) => {
      if (track.readyState === 'live') {
        track.stop();
      }
    });
  }

  public onStartStop() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
    this.isRecording = !this.isRecording;
  }
}
