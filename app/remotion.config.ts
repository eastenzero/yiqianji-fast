import { Config } from '@remotion/cli/config';
import { enableTailwind } from '@remotion/tailwind-v4';

/**
 * Remotion 4.x 配置。
 * - 启用 Tailwind v4 的 webpack 集成（与 app/src 共享 utility 生态）
 * - 编码采用 H.264 · AAC，1080p @ 30fps 场景下兼容性最好
 * - 渲染并发根据 CPU 自适应，可在命令行传 --concurrency 覆盖
 */

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setColorSpace('default');

Config.overrideWebpackConfig((currentConfig) => {
  return enableTailwind(currentConfig);
});
