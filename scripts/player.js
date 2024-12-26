let flvPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 从环境变量获取默认播放地址
async function loadDefaultStreamUrl() {
    try {
        const response = await fetch('/_stream');
        const data = await response.json();
        if (data.url) {
            document.getElementById('streamUrl').value = data.url;
            play();
        }
    } catch (error) {
        console.error('Failed to load default stream URL');
    }
}

function play() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    if (!streamUrl) {
        return;
    }

    // iOS设备使用原生HLS播放器
    if (isIOS()) {
        // 假设服务器支持将相同的流同时输出为HLS格式
        // 将flv地址转换为hls地址
        const hlsUrl = streamUrl.replace('.flv', '.m3u8');
        videoElement.src = hlsUrl;
        videoElement.play();
        return;
    }

    // 其他设备使用flv.js
    flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: streamUrl
    });
    
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();
}

// 页面加载完成后获取默认播放地址
document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    if (flvPlayer) {
        flvPlayer.destroy();
    }
});
