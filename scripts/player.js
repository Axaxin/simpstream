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

        // 创建播放器实例
        player = new window.Player({
            id: 'videoPlayer',
            url: streamUrl,
            isLive: true,
            fluid: true,
            autoplay: true,
            playsinline: true,
            plugins: [{
                plugin: window.FlvPlugin,
                options: {
                    type: 'flv',
                    cors: true,
                    hasAudio: true,
                    hasVideo: true,
                    isLive: true,
                    withCredentials: false,
                    enableWorker: true,
                    lazyLoad: false,
                    stashInitialSize: 128
                }
            }]
        });

        // 事件监听
        player.on('error', (err) => {
            console.error('播放器错误:', err);
            if (err.data) {
                console.error('错误详情:', err.data);
            }
            if (err.message) {
                console.error('错误消息:', err.message);
            }
        });

        player.on('ready', () => {
            console.log('播放器就绪，尝试播放');
            try {
                player.play().catch(e => {
                    console.error('播放调用失败:', e);
                });
            } catch (e) {
                console.error('播放调用异常:', e);
            }
        });

        player.on('playing', () => {
            console.log('开始播放中');
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

        player.on('canplay', () => {
            console.log('可以开始播放');
        });

        player.on('pause', () => {
            console.log('播放暂停');
        });

        player.on('seeking', () => {
            console.log('正在跳转');
        });

        player.on('seeked', () => {
            console.log('跳转完成');
        });

        player.on('timeupdate', () => {
            console.log('播放进度更新:', player.currentTime);
        });

        player.on('ended', () => {
            console.log('播放结束');
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
