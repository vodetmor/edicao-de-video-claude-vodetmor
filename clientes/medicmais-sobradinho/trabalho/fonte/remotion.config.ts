import {Config} from '@remotion/cli/config';
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
// src e public são links para a pasta da obra no /mnt
Config.overrideWebpackConfig((c) => ({...c, resolve: {...c.resolve, symlinks: false}}));
