let flvPlayer = null;
let ffmpeg = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

async function initFFmpeg() {
    if (!ffmpeg) {
        showLoading();
        ffmpeg = new FFmpeg();
        await ffmpeg.load();
        hideLoading();
    }
    return ffmpeg;
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
}

async function initFFmpegPlayer(streamUrl) {
    console.log('初始化FFmpeg播放器...');
    
    try {
        const ffmpeg = await initFFmpeg();
        const videoElement = document.getElementById('videoPlayer');
        
        // 设置视频元素属性
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');
        videoElement.setAttribute('x5-playsinline', '');
        
        // 创建 MediaSource
        const mediaSource = new MediaSource();
        videoElement.src = URL.createObjectURL(mediaSource);
        
        await new Promise((resolve) => {
            mediaSource.addEventListener('sourceopen', resolve, { once: true });
        });
        
        // 创建 SourceBuffer
        const mimeType = 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"';
        const sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        
        // 开始获取流数据
        const response = await fetch(streamUrl);
        if (!response.ok) throw new Error('Failed to fetch stream');
        
        const reader = response.body.getReader();
        
        // 创建转换流
        const transformStream = new TransformStream({
            async transform(chunk, controller) {
                // 将 FLV 数据转换为 MP4
                await ffmpeg.writeFile('input.flv', chunk);
                await ffmpeg.exec([
                    '-i', 'input.flv',
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-f', 'mp4',
                    '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
                    'output.mp4'
                ]);
                
                const data = await ffmpeg.readFile('output.mp4');
                controller.enqueue(data);
            }
        });
        
        // 开始处理流
        reader.read().then(function processChunk({ done, value }) {
            if (done) {
                console.log('Stream ended');
                return;
            }
            
            // 处理数据块
            transformStream.writable.write(value).then(() => {
                reader.read().then(processChunk);
            });
        });
        
        // 处理转换后的数据
        const reader2 = transformStream.readable.getReader();
        while (true) {
            const { done, value } = await reader2.read();
            if (done) break;
            
            // 等待之前的数据处理完成
            if (sourceBuffer.updating) {
                await new Promise(resolve => {
                    sourceBuffer.addEventListener('updateend', resolve, { once: true });
                });
            }
            
            // 添加到 SourceBuffer
            sourceBuffer.appendBuffer(value);
        }
        
        // 尝试播放
        try {
            await videoElement.play();
            console.log('播放开始');
        } catch (e) {
            console.error('播放失败:', e);
            videoElement.muted = true;
            await videoElement.play();
        }
        
    } catch (error) {
        console.error('FFmpeg播放器初始化失败:', error);
        throw error;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('原始流地址:', streamUrl);
        console.log('是否为iOS设备:', isIOS());

        destroyPlayers();
        
        if (isIOS()) {
            console.log('使用FFmpeg.wasm播放器');
            await initFFmpegPlayer(streamUrl);
        } else if (window.flvjs && window.flvjs.isSupported()) {
            console.log('使用flv.js播放器');
            const videoElement = document.getElementById('videoPlayer');
            
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
    await initPlayer(streamUrl);
}

async function loadDefaultStreamUrl() {
    console.log('加载默认流地址');
    try {
        const response = await fetch('/_stream');
        const data = await response.json();
        if (data.url) {
            console.log('获取到默认流地址:', data.url);
            document.getElementById('streamUrl').value = data.url;
            await initPlayer(data.url);  // 直接初始化播放器
        }
    } catch (error) {
        console.error('加载默认流地址失败:', error);
    }
}

// 页面加载完成后加载默认流地址
document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载前销毁播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
