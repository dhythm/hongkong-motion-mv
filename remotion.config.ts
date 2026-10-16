import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(6);
// 同梱の chrome-headless-shell がこの環境で起動しないため、システムの Chrome を使う
Config.setBrowserExecutable('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
Config.setDelayRenderTimeoutInMilliseconds(60000);
