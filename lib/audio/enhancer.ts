"use client";

export class AudioEnhancer {
  private context: AudioContext;
  private source: MediaStreamAudioSourceNode | null = null;
  private filter: BiquadFilterNode;
  private compressor: DynamicsCompressorNode;
  private output: MediaStreamAudioDestinationNode;

  constructor() {
    this.context = new AudioContext();
    this.output = this.context.createMediaStreamDestination();
    
    // Low-pass filter to remove high-frequency noise
    this.filter = this.context.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.setValueAtTime(8000, this.context.currentTime);

    // Compressor to normalize amplitude (gain control)
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, this.context.currentTime);
    this.compressor.knee.setValueAtTime(40, this.context.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.context.currentTime);
    this.compressor.attack.setValueAtTime(0, this.context.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.context.currentTime);

    this.filter.connect(this.compressor);
    this.compressor.connect(this.output);
  }

  public processStream(stream: MediaStream): MediaStream {
    if (this.source) {
      this.source.disconnect();
    }
    this.source = this.context.createMediaStreamSource(stream);
    this.source.connect(this.filter);
    return this.output.stream;
  }

  public async close() {
    if (this.context.state !== "closed") {
      await this.context.close();
    }
  }
}
