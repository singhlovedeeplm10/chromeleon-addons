import { config } from './config.js';

export const canvasSpoofing = {
  toDataURL: function (target) {
    let proto = target.prototype ? target.prototype : target.__proto__;
    
    proto.toDataURL = new Proxy(proto.toDataURL, {
      apply(target, self, args) {
        try {
          const options = {
            willReadFrequently: true,
            desynchronized: true,
          };

          var contextTypes = ["2d", "webgl", "webgl2", "webgpu", "bitmaprenderer"];
          var ctx = null;
          for (var i = 0; i < contextTypes.length; i++) {
            ctx = self.getContext(contextTypes[i], options);
            if (ctx) break;
          }
          if (ctx instanceof CanvasRenderingContext2D) {
            const imageData = ctx.getImageData(0, 0, self.width, self.height);
            const noiseAmplitude = config.noiseLevel === "high" ? 2 : config.noiseLevel === "medium" ? 1 : 0.5;

            for (let i = 0; i < imageData.data.length; i += 4) {
              imageData.data[i] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Red
              imageData.data[i + 1] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Green
              imageData.data[i + 2] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Blue
            }

            ctx.putImageData(imageData, 0, 0);
          } else if (ctx instanceof WebGLRenderingContext || ctx instanceof WebGL2RenderingContext) {
            const pixels = new Uint8Array(self.width * self.height * 4);
            ctx.readPixels(0, 0, self.width, self.height, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);

            const noiseAmplitude = config.noiseLevel === "high" ? 2 : config.noiseLevel === "medium" ? 1 : 0.5;

            for (let i = 0; i < pixels.length; i += 4) {
              pixels[i] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Red
              pixels[i + 1] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Green
              pixels[i + 2] += Math.floor((Math.random() - 0.5) * noiseAmplitude * 2); // Blue
            }

            // TODO: Optionally, you can write the modified pixels back to the canvas if needed
            // This requires creating a new texture or using a framebuffer
            // ctx.bindTexture(ctx.TEXTURE_2D, ctx.createTexture());
            // ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, self.width, self.height, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, pixels);
          }
        } catch (error) {
          console.error("Error in toDataURL spoofing", error);
        }
        return Reflect.apply(target, self, args);
      },
    });
  },
};