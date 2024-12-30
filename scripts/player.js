let flvPlayer = null;

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

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
}

// 获取流地址
function getStreamUrl(isHLS = false) {
    // 从环境变量获取基础FLV地址
    const flvUrl = process.env.STREAM_URL || 'https://winlive.metacorn.cc/hdl/live/win.flv';
    
    if (isHLS) {
        // 将FLV地址转换为HLS地址
        return flvUrl
            .replace('/hdl/', '/hls/')
            .replace('.flv', '.m3u8');
    }
    
    return flvUrl;
}

async function initPlayer(streamUrl) {
    const videoElement = document.getElementById('videoPlayer');
    
    // 设置视频元素属性
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.setAttribute('x5-playsinline', '');
    
    // 销毁现有播放器
    destroyPlayers();
    
    if (isIOS()) {
        console.log('使用原生HLS播放器');
        const hlsUrl = getStreamUrl(true);
        videoElement.src = hlsUrl;
        try {
            await videoElement.play();
        } catch (error) {
            console.error('播放失败:', error);
        }
    } else {
        console.log('使用FLV.js播放器');
        if (flv.isSupported()) {
            flvPlayer = flv.createPlayer({
                type: 'flv',
                url: streamUrl,
                isLive: true
            });
            flvPlayer.attachMediaElement(videoElement);
            flvPlayer.load();
            try {
                await flvPlayer.play();
            } catch (error) {
                console.error('播放失败:', error);
            }
        } else {
            console.error('您的浏览器不支持FLV播放');
        }
    }
}

function play() {
    const streamUrl = document.getElementById('streamUrl').value || getStreamUrl();
    initPlayer(streamUrl);
}

async function loadDefaultStreamUrl() {
    const defaultUrl = getStreamUrl();
    document.getElementById('streamUrl').value = defaultUrl;
    await initPlayer(defaultUrl);
}

// 页面加载完成后加载默认流地址
document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载前销毁播放器
window.addEventListener('beforeunload', () => {
    destroyPlayers();
});
