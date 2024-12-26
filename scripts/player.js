let flvPlayer = null;
let vjsPlayer = null;
let mediaSource = null;
let sourceBuffer = null;
let webCodecDecoder = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 检测是否支持WebCodec
function isWebCodecSupported() {
    return 'VideoDecoder' in window && 'AudioDecoder' in window;
}

// 将FLV地址转换为HLS地址
function convertToHLSUrl(flvUrl) {
    // 这里需要根据你的流媒体服务器配置来修改
    // 假设你的服务器支持将相同路径的流同时以FLV和HLS格式提供
    return flvUrl.replace('/live/', '/live/hls/').replace('.flv', '.m3u8');
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
    if (vjsPlayer) {
        vjsPlayer.dispose();
        vjsPlayer = null;
    }
    if (webCodecDecoder) {
        webCodecDecoder.destroy();
        webCodecDecoder = null;
    }
}

class WebCodecPlayer {
    constructor(videoElement) {
        this.videoElement = videoElement;
        this.videoDecoder = null;
        this.audioDecoder = null;
        this.flvDemuxer = null;
        this.isPlaying = false;
    }

    async init(url) {
        try {
            // 创建 VideoDecoder
            this.videoDecoder = new VideoDecoder({
                output: frame => this.onDecodedFrame(frame),
                error: e => console.error('Video decoder error:', e)
            });

            // 创建 AudioDecoder
            this.audioDecoder = new AudioDecoder({
                output: frame => this.onDecodedAudio(frame),
                error: e => console.error('Audio decoder error:', e)
            });

            // 创建 FLV Demuxer
            this.flvDemuxer = flvjs.createPlayer({
                type: 'flv',
                url: url,
                isLive: true,
                hasAudio: true,
                hasVideo: true,
                cors: true
            });

            // 配置 Demuxer 事件监听
            this.flvDemuxer.on(flvjs.Events.MEDIA_SEGMENT, (type, data) => {
                if (type === 'video') {
                    this.decodeVideoChunk(data);
                } else if (type === 'audio') {
                    this.decodeAudioChunk(data);
                }
            });

            await this.videoDecoder.configure({
                codec: 'avc1.42E01E', // H.264 Baseline
                width: 1920,
                height: 1080
            });

            await this.audioDecoder.configure({
                codec: 'mp4a.40.2', // AAC-LC
                sampleRate: 44100,
                numberOfChannels: 2
            });

            // 开始加载流
            this.flvDemuxer.load();
            this.isPlaying = true;

        } catch (error) {
            console.error('WebCodec初始化失败:', error);
            throw error;
        }
    }

    async decodeVideoChunk(chunk) {
        if (!this.isPlaying) return;
        try {
            const videoChunk = new EncodedVideoChunk({
                type: chunk.keyframe ? 'key' : 'delta',
                timestamp: chunk.pts,
                duration: chunk.duration,
                data: chunk.data
            });
            await this.videoDecoder.decode(videoChunk);
        } catch (e) {
            console.error('Video chunk decode error:', e);
        }
    }

    async decodeAudioChunk(chunk) {
        if (!this.isPlaying) return;
        try {
            const audioChunk = new EncodedAudioChunk({
                type: 'key',
                timestamp: chunk.pts,
                duration: chunk.duration,
                data: chunk.data
            });
            await this.audioDecoder.decode(audioChunk);
        } catch (e) {
            console.error('Audio chunk decode error:', e);
        }
    }

    onDecodedFrame(frame) {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = frame.displayWidth;
            canvas.height = frame.displayHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(frame, 0, 0);
            frame.close();
        } catch (e) {
            console.error('Frame rendering error:', e);
        }
    }

    onDecodedAudio(audioFrame) {
        try {
            const audioCtx = new AudioContext();
            const buffer = audioCtx.createBuffer(
                audioFrame.numberOfChannels,
                audioFrame.numberOfFrames,
                audioFrame.sampleRate
            );

            // 将音频数据复制到缓冲区
            for (let i = 0; i < audioFrame.numberOfChannels; i++) {
                buffer.copyToChannel(audioFrame.planes[i], i);
            }

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();

            audioFrame.close();
        } catch (e) {
            console.error('Audio rendering error:', e);
        }
    }

    destroy() {
        this.isPlaying = false;
        if (this.videoDecoder) {
            this.videoDecoder.close();
        }
        if (this.audioDecoder) {
            this.audioDecoder.close();
        }
        if (this.flvDemuxer) {
            this.flvDemuxer.destroy();
        }
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('流地址:', streamUrl);
        console.log('是否为iOS设备:', isIOS());
        console.log('是否支持WebCodec:', isWebCodecSupported());

        destroyPlayers();
        const videoElement = document.getElementById('videoPlayer');

        if (isIOS() && isWebCodecSupported()) {
            console.log('使用WebCodec播放器');
            webCodecDecoder = new WebCodecPlayer(videoElement);
            await webCodecDecoder.init(streamUrl);
        } else if (isIOS()) {
            console.log('检测到iOS设备，使用HLS格式播放');
            const hlsUrl = convertToHLSUrl(streamUrl);
            console.log('转换后的HLS地址:', hlsUrl);
            
            vjsPlayer = videojs('videoPlayer', {
                techOrder: ['html5'],
                sources: [{
                    src: hlsUrl,
                    type: 'application/x-mpegURL'  // HLS格式的MIME类型
                }],
                autoplay: true,
                controls: true,
                fluid: true,
                aspectRatio: '16:9',
                playsinline: true,
                html5: {
                    hls: {
                        enableLowInitialPlaylist: true,
                        smoothQualityChange: true,
                        overrideNative: true
                    }
                }
            });

            // 监听错误事件
            vjsPlayer.on('error', function() {
                console.error('Video.js播放错误:', vjsPlayer.error());
                alert('播放失败，请确认视频源是否正确');
            });
        } else if (window.flvjs && window.flvjs.isSupported()) {
            console.log('使用原生flv.js播放器');
            flvPlayer = window.flvjs.createPlayer({
                type: 'flv',
                url: streamUrl,
                isLive: true,
                hasAudio: true,
                hasVideo: true,
                cors: true
            });

            flvPlayer.attachMediaElement(videoElement);
            flvPlayer.load();
            flvPlayer.play();
        } else {
            console.error('当前浏览器不支持视频播放');
            alert('当前浏览器不支持视频播放，请尝试使用其他浏览器');
        }

        console.log('播放器初始化完成');
    } catch (error) {
        console.error('播放器初始化失败:', error);
        alert('播放器初始化失败，请刷新页面重试');
        throw error;
    }
}

async function play() {
    const streamUrl = document.getElementById('streamUrl').value;
    if (!streamUrl) {
        console.warn('未提供流地址');
        return;
    }

    try {
        await initPlayer(streamUrl);
    } catch (error) {
        console.error('播放失败:', error);
    }
}

async function loadDefaultStreamUrl() {
    console.log('加载默认流地址');
    try {
        const response = await fetch('/_stream');
        const data = await response.json();
        if (data.url) {
            console.log('获取到默认流地址:', data.url);
            document.getElementById('streamUrl').value = data.url;
            play();
        }
    } catch (error) {
        console.error('加载默认流地址失败:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
