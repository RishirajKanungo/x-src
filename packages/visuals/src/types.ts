import { BeatSnapshot } from '@x-src/core';

export interface MusicUniforms {
  time: number;
  bpm: number;
  beatPhase: number;
  barPhase: number;
  sectionIndex: number;
  energy: number;
}

export interface ShaderPack {
  name: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: MusicUniforms;
  parameters: Record<string, number>;
}

export interface RenderOptions {
  width: number;
  height: number;
  beatSnapshot: BeatSnapshot;
  energy: number;
  customParams?: Record<string, number>;
}

export interface WebGPUContext {
  device: GPUDevice;
  queue: GPUQueue;
  canvas: HTMLCanvasElement;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

export interface RenderPipeline {
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}
