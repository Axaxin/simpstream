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

        // FLV 配置
        const flvConfig = {
            type: 'flv',
            url: streamUrl,
            isLive: true,
            hasAudio: true,
            hasVideo: true,
            enableStashBuffer: false,
            stashInitialSize: 128,
            cors: true
        };

        // 基础配置
        player = new Player({
            id: 'videoPlayer',
            isLive: true,
            fluid: true,
            autoplay: true,
            playsinline: true,
            width: '100%',
            height: '100%',
            plugins: [{
                plugin: Player.FlvPlayer,
                options: flvConfig
            }]
        });

        // 事件监听
        player.on('error', (err) => {
            console.error('播放器错误:', err);
            if (err.mediaError) {
                console.error('媒体错误:', err.mediaError);
            }
            if (err.networkError) {
                console.error('网络错误:', err.networkError);
            }
        });

        player.on('ready', () => {
            console.log('播放器就绪');
            try {
                player.play().catch(e => {
                    console.error('自动播放失败:', e);
                });
            } catch (e) {
                console.error('播放出错:', e);
            }
        });

        player.on('playing', () => {
            console.log('开始播放');
        });

        player.on('waiting', () => {
            console.log('等待数据...');
        });

        player.on('loadstart', () => {
            console.log('开始加载数据');
        });

        player.on('loadeddata', () => {
            console.log('数据加载完成');
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
