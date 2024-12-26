let player = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
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
    if (player) {
        player.destroy();
        player = null;
    }

    const streamUrl = document.getElementById('streamUrl').value;
    if (!streamUrl) {
        return;
    }

    player = new DPlayer({
        container: document.getElementById('videoPlayer'),
        live: true,
        video: {
            url: streamUrl,
            type: 'customFlv',
            customType: {
                customFlv: function(video, player) {
                    const flvPlayer = flvjs.createPlayer({
                        type: 'flv',
                        url: video.src,
                        isLive: true,
                        hasAudio: true,
                        hasVideo: true
                    });
                    flvPlayer.attachMediaElement(video);
                    flvPlayer.load();
                    flvPlayer.play();
                }
            }
        }
    });
}

// 页面加载完成后获取默认播放地址
document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    if (player) {
        player.destroy();
    }
});
