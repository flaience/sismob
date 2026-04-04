declare module "pannellum-react" {
  import { Component } from "react";

  interface PannellumProps {
    width?: string;
    height?: string;
    image?: string;
    pitch?: number;
    yaw?: number;
    hfov?: number;
    autoLoad?: boolean;
    autoRotate?: number;
    compass?: boolean;
    preview?: string;
    previewTitle?: string;
    previewAuthor?: string;
    title?: string;
    author?: string;
    showZoomCtrl?: boolean;
    showFullscreenCtrl?: boolean;
    mouseZoom?: boolean;
    onLoad?: () => void;
    onRender?: () => void;
    onError?: (err: string) => void;
    className?: string;
  }

  export class Pannellum extends Component<PannellumProps> {}
  export class PannellumVideo extends Component<any> {}
}
