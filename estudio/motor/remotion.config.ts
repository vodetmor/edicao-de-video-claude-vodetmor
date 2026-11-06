import {Config} from '@remotion/cli/config';
import {existsSync} from 'fs';
const LINUX = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(LINUX)) Config.setBrowserExecutable(LINUX);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setConcurrency(4);
