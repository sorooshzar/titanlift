/**
 * Manages a single stable camera session across both barcode and label scanning.
 * Prevents camera crashes from mode switching.
 */
export class CameraManager {
  constructor() {
    this.stream = null;
    this.videoRef = null;
  }

  async start(videoRef, facingMode = "environment") {
    this.videoRef = videoRef;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
    }
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    if (this.videoRef) {
      this.videoRef.srcObject = this.stream;
      await new Promise(resolve => {
        this.videoRef.onloadedmetadata = resolve;
      });
      this.videoRef.play();
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.videoRef = null;
  }

  captureFrame(canvasRef) {
    if (!this.videoRef || !canvasRef) return null;
    const canvas = canvasRef;
    canvas.width = this.videoRef.videoWidth;
    canvas.height = this.videoRef.videoHeight;
    canvas.getContext("2d").drawImage(this.videoRef, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  isActive() {
    return this.stream !== null;
  }
}