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
      // Wait for video to load metadata before playing
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Video loading timeout")), 5000);
        const onLoadedMetadata = () => {
          this.videoRef.removeEventListener("loadedmetadata", onLoadedMetadata);
          clearTimeout(timeout);
          resolve();
        };
        this.videoRef.addEventListener("loadedmetadata", onLoadedMetadata);
      });
      // Ensure video is playing
      try {
        await this.videoRef.play();
      } catch (e) {
        // Autoplay might be blocked, continue anyway
      }
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
    const ctx = canvas.getContext("2d");
    
    // Flip horizontally to handle mirrored camera streams (front-facing cameras)
    ctx.scale(-1, 1);
    ctx.drawImage(this.videoRef, -canvas.width, 0);
    
    return canvas.toDataURL("image/jpeg", 0.85);
  }

  isActive() {
    return this.stream !== null;
  }
}