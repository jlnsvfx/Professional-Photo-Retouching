export interface EditState {
  originalImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  prompt: string;
  error: string | null;
}

export interface ImageFile {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  READY_TO_EDIT = 'READY_TO_EDIT',
  PROCESSING = 'PROCESSING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}
