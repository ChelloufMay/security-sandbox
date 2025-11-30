// src/types/qrcode-react.d.ts
declare module "qrcode.react" {
    import * as React from "react";
    export interface QRCodeProps {
        value: string;
        size?: number;
        level?: "L" | "M" | "Q" | "H";
        bgColor?: string;
        fgColor?: string;
        includeMargin?: boolean;
        renderAs?: "canvas" | "svg";
    }
    export const QRCodeSVG: React.FC<QRCodeProps>;
    export const QRCodeCanvas: React.FC<QRCodeProps>;
    export default QRCodeSVG; // keep a default if any consumer expects it
}
