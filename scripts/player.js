let flvPlayer = null;

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('流地址:', streamUrl);

        destroyPlayers();

        const videoElement = document.getElementById('videoPlayer');
        videoElement.volume = 0.8;

        if (window.flvjs && window.flvjs.isSupported()) {
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

            videoElement.play().catch(e => {
                console.error('自动播放失败:', e);
            });

            console.log('播放器初始化完成');
        } else {
            console.error('当前浏览器不支持 FLV 播放');
        }
    } catch (error) {
        console.error('播放器初始化失败:', error);
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
