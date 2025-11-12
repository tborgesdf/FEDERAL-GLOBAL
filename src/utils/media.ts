/**
 * UTILITÁRIOS DE MÍDIA (CÂMERA)
 * Detecção e configuração de dispositivos de vídeo
 */

/**
 * Verifica se o dispositivo possui entrada de vídeo (câmera)
 */
export async function hasVideoInput(): Promise<boolean> {
  // Guard para SSR
  if (typeof window === 'undefined' || !navigator.mediaDevices) {
    return false;
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((device) => device.kind === 'videoinput');
  } catch (error) {
    console.warn('Erro ao enumerar dispositivos de mídia:', error);
    return false;
  }
}

/**
 * Retorna constraints otimizadas para câmera frontal (selfie)
 */
export function getUserFacingConstraints(): MediaStreamConstraints {
  return {
    video: {
      facingMode: 'user', // Câmera frontal
      width: { ideal: 1280 },
      height: { ideal: 720 },
    },
    audio: false,
  };
}

/**
 * Retorna constraints para câmera traseira (documentos)
 */
export function getEnvironmentFacingConstraints(): MediaStreamConstraints {
  return {
    video: {
      facingMode: { ideal: 'environment' }, // Câmera traseira em dispositivos móveis
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  };
}

/**
 * Para todas as tracks de um MediaStream
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  stream.getTracks().forEach((track) => {
    track.stop();
  });
}

/**
 * Captura frame de um elemento <video> e retorna Blob JPEG
 */
export function captureFrameFromVideo(
  video: HTMLVideoElement,
  quality: number = 0.95
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    } catch (error) {
      console.error('Erro ao capturar frame:', error);
      resolve(null);
    }
  });
}

/**
 * Converte Blob para File
 */
export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type });
}

/**
 * Cria URL de preview para Blob/File
 */
export function createPreviewUrl(file: Blob | File): string {
  return URL.createObjectURL(file);
}

/**
 * Revoga URL de preview (libera memória)
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Verifica se o navegador suporta getUserMedia
 */
export function supportsGetUserMedia(): boolean {
  return !!(
    typeof window !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia
  );
}

/**
 * Solicita permissão de câmera e retorna stream
 */
export async function requestCameraAccess(
  constraints: MediaStreamConstraints = getUserFacingConstraints()
): Promise<{ stream: MediaStream | null; error: string | null }> {
  if (!supportsGetUserMedia()) {
    return {
      stream: null,
      error: 'Seu navegador não suporta acesso à câmera.',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    return { stream, error: null };
  } catch (error: any) {
    let errorMessage = 'Não foi possível acessar a câmera.';

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Permissão negada para usar a câmera. Verifique as configurações do navegador.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'Nenhuma câmera encontrada neste dispositivo.';
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Câmera está sendo usada por outro aplicativo.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Câmera não atende aos requisitos necessários.';
    }

    console.error('Erro ao acessar câmera:', error);
    return { stream: null, error: errorMessage };
  }
}

