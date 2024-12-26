let flvPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 将 FLV 地址转换为 HLS 地址
function convertToHLSUrl(url) {
    // 将 hdl/live/xxx.flv 转换为 hls/live/xxx.m3u8
    return url.replace('/hdl/', '/hls/').replace('.flv', '.m3u8');
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('原始流地址:', streamUrl);
        console.log('是否为iOS设备:', isIOS());

        destroyPlayers();
        
        if (isIOS()) {
            console.log('使用原生播放器(HLS)');
            const videoElement = document.getElementById('videoPlayer');
            const hlsUrl = convertToHLSUrl(streamUrl);
            console.log('HLS流地址:', hlsUrl);
            
            // 设置视频源
            videoElement.src = hlsUrl;
            
            // 设置必要的属性
            videoElement.setAttribute('playsinline', '');  // 防止全屏
            videoElement.setAttribute('webkit-playsinline', '');  // iOS Safari
            videoElement.setAttribute('x5-playsinline', '');  // 微信浏览器
            
            // 错误处理
            videoElement.onerror = function(e) {
                console.error('视频播放错误:', e);
                alert('播放出错，请刷新页面重试');
            };
            
            // 尝试播放
            try {
                await videoElement.play();
            } catch (e) {
                console.error('自动播放失败:', e);
                // iOS可能需要用户手动点击播放
            }

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
