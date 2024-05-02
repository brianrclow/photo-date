import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ImageAsset, ImageSource, isAndroid } from "@nativescript/core";
import {
  CameraLoadedEvent,
  CameraPlus,
  ImagesSelectedEvent,
  PhotoCapturedEvent,
  ToggleCameraEvent,
} from "@nstudio/nativescript-camera-plus";

import { registerElement } from "@nativescript/angular";
registerElement("CameraPlus", () => CameraPlus);
import * as permission from "@nativescript-community/perms";

@Component({
  selector: "ns-items",
  templateUrl: "./items.component.html",
})
export class ItemsComponent {
  @ViewChild("camP", { static: false }) camPlus: ElementRef<CameraPlus>;

  public imageSource: ImageSource;
  public showOverlay = false;
  public overlayChanged = 0;
  public cam: CameraPlus;

  public today = new Date();

  static {
    // CameraPlus.defaultCamera = CameraPlusConstants.defaultCamera; // 'rear' or 'front'
    CameraPlus.defaultCamera === "front";
  }

  constructor(private zone: NgZone) {}

  cameraLoadedEvent(event: CameraLoadedEvent): void {
    console.log(" ");

    console.log("LOADED");
    console.log(" ");
    console.log(" ");
    console.log("Event Object:", event.object);

    console.log(" ");

    this.logCamEvent("CameraPlus.cameraLoadedEvent", event);

    // this.cam = <CameraPlus>this.camPlus.nativeElement;
    this.cam = event.object;

    console.log("this.cam");
    console.log(this.cam);

    console.log("this.cam.getCurrentCamera");

    if (this.cam.getCurrentCamera() === "rear") {
      // this.cam.toggleCamera();
      console.log("REAR");
      // setTimeout(() => {
      //   this.cam.toggleCamera();
      // }, 1000);
    }

    (async () => {
      let result = await permission.check("camera");
      if (result[0] !== "authorized") {
        result = await permission.request("camera");
      }

      this.cam.autoFocus = true;

      const flashMode = this.cam.getFlashMode();
      // Turn flash on at startup
      if (flashMode === "off") {
        this.cam.toggleFlash();
      }

      this.logFlashMode();
      this.logAvailablePictureSizes();
      this.logSupportRatios();
    })();
  }

  logFlashMode(): void {
    try {
      const flashMode = this.cam.getFlashMode();
      console.info(`Flash Mode: ${flashMode}`);
    } catch (error) {
      console.error(`Flash Mode: Failed to load: ${error.message}`);
      console.error(error.stack);
    }
  }

  toggleFlashOnCam(): void {
    console.info(`Toggle Flash.`);
    this.cam.toggleFlash();
  }

  logAvailablePictureSizes(): void {
    const ratio = "16:9";
    const availableSizes = this.cam.getAvailablePictureSizes("16:9");
    console.info(`Picture Sizes Available for ${ratio}:`);
    for (const size of availableSizes) {
      console.info(size);
    }
    console.info(`Total sizes available: ${availableSizes.length}`);
  }

  logSupportRatios(): void {
    const supportedRatios = this.cam.getSupportedRatios();
    if (supportedRatios.length === 0) {
      console.warn("Ratios supported: None found.");
    } else {
      console.info("Ratios supported:" + supportedRatios.join(", "));
    }
  }

  imagesSelectedEvent(event: ImagesSelectedEvent): void {
    console.info(`Image Selected.`);
    this.logCamEvent("CameraPlus.imagesSelectedEvent", event);
    this.loadImage(event.data[0]);
  }

  photoCapturedEvent(event: PhotoCapturedEvent): void {
    console.info(`Photo Captured.`);
    this.logCamEvent("CameraPlus.photoCapturedEvent", event);
    this.loadImage(event.data);
  }

  toggleCameraEvent(event: ToggleCameraEvent): void {
    console.info(`Camera Toggled.`);
    this.logCamEvent("CameraPlus.toggleCameraEvent", event);
  }

  recordDemoVideo(): void {
    try {
      console.info(`Start recording`);
      this.cam.record({
        saveToGallery: true,
      });
    } catch (err) {
      console.error(err);
    }
  }

  stopRecordingDemoVideo(): void {
    try {
      console.info(`Stop recording`);
      this.cam.stop();
      console.info(`After Stop recording`);
    } catch (err) {
      console.error(err);
    }
  }

  toggleTheCamera(): void {
    console.info(`Toggle Camera.`);
    this.cam.toggleCamera();
  }

  openCamPlusLibrary(): void {
    console.info(`Open Cam Plus Library.`);
    this.cam.chooseFromLibrary();
  }

  takePicFromCam(): void {
    console.info(`Take Pic From Cam.`);
    this.cam.takePicture({ saveToGallery: true });
  }

  toggleOverlay(): void {
    console.info(`Toggle Overlay. Toggle again to reveal different examples.`);
    this.showOverlay = !this.showOverlay;
    if (this.showOverlay) {
      this.overlayChanged++;
    }
  }

  async loadImage(imageAsset: ImageAsset): Promise<void> {
    if (imageAsset) {
      try {
        const imgSrc = await ImageSource.fromAsset(imageAsset);
        if (imgSrc) {
          this.zone.run(() => {
            this.imageSource = imgSrc;
          });
        } else {
          this.imageSource = null;
          alert("Image source is bad.");
        }
      } catch (error) {
        this.imageSource = null;
        console.log("Error getting image source: ");
        console.error(error);
        alert("Error getting image source from asset");
      }
    } else {
      console.log("Image Asset was null");
      alert("Image Asset was null");
      this.imageSource = null;
    }
  }

  logCamEvent(listenerName: string, event: any) {
    console.log(`${listenerName}`);
    console.log(`Name: ${event.eventName}`);
    console.log(`Data: ${event.data}`);
    console.log(`Object: ${event.object}`);
    console.log(`Message: ${event.message}`);
  }
}
