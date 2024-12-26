let flvPlayer = null;
let jessibucaPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
    if (jessibucaPlayer) {
        jessibucaPlayer.destroy();
        jessibucaPlayer = null;
    }
}

function play() {
    destroyPlayers();

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    if (!streamUrl) {
        return;
    }

    // iPhone设备使用Jessibuca播放器
    if (isIOS()) {
        const container = videoElement.parentElement;
        const playerContainer = document.createElement('div');
        playerContainer.id = 'jessibucaPlayer';
        playerContainer.style.width = '100%';
        playerContainer.style.height = '100%';
        container.replaceChild(playerContainer, videoElement);

        jessibucaPlayer = new window.Jessibuca({
            container: playerContainer,
            videoBuffer: 0.2,
            isResize: true,
            debug: false,
            hotKey: false,
            loadingText: '加载中...',
            background: '#000000',
            decoder: '/scripts/decoder.js'
        });

        jessibucaPlayer.play(streamUrl);
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

document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
