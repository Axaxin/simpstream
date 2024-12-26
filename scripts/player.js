let player = null;

function destroyPlayers() {
    if (player) {
        player.destroy();
        player = null;
    }
}

async function initPlayer(videoElement, streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('流地址:', streamUrl);

        // 移除旧的 video 元素
        const oldVideo = document.getElementById('videoPlayer');
        const container = oldVideo.parentElement;
        oldVideo.remove();

        // 创建新的 div 元素
        const playerContainer = document.createElement('div');
        playerContainer.id = 'videoPlayer';
        container.appendChild(playerContainer);

        // 创建播放器实例
        const config = {
            id: 'videoPlayer',
            isLive: true,
            fluid: true,
            width: '100%',
            height: '100%',
            autoplay: true,
            volume: 1,
            url: streamUrl,
            type: 'flv',
            cors: true,
            hasAudio: true,
            hasVideo: true,
            isLive: true,
            withCredentials: false,
            enableStashBuffer: false,
            stashInitialSize: 128,
            autoCleanupSourceBuffer: true
        };

        player = new window.FlvPlayer(config);

        // 事件监听
        player.on('error', (err) => {
            console.error('播放器错误:', err);
        });

        player.on('ready', () => {
            console.log('播放器就绪');
        });

        player.on('playing', () => {
            console.log('开始播放');
        });

        player.on('waiting', () => {
            console.log('等待数据...');
        });

        console.log('播放器初始化完成');
    } catch (error) {
        console.error('播放器初始化失败:', error);
        throw error;
    }
}

async function play() {
    console.log('开始播放流程');
    destroyPlayers();

    const streamUrl = document.getElementById('streamUrl').value;
    if (!streamUrl) {
        console.warn('未提供流地址');
        return;
    }

    try {
        await initPlayer(document.getElementById('videoPlayer'), streamUrl);
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
