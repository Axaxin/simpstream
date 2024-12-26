let player = null;

function destroyPlayers() {
    if (player) {
        player.destroy();
        player = null;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('流地址:', streamUrl);

        destroyPlayers();

        player = new Player({
            id: 'videoPlayer',
            url: streamUrl,
            isLive: true,
            fluid: true,
            playsinline: true,
            volume: 0.8,
            plugins: [{
                plugin: FlvPlugin,
                options: {
                    mediaDataSource: {
                        type: 'flv',
                        cors: true,
                        hasAudio: true,
                        hasVideo: true,
                        isLive: true
                    }
                }
            }]
        });

        // 事件监听
        player.on('error', (err) => {
            console.error('播放器错误:', err);
        });

        player.on('ready', () => {
            console.log('播放器就绪');
            player.play();
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
