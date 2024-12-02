let flvPlayer = null;

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
    }

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    if (!streamUrl) {
        return;
    }

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
