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

        // 移除旧的 video 元素
        const oldVideo = document.getElementById('videoPlayer');
        const container = oldVideo.parentElement;
        oldVideo.remove();

        // 创建新的 video 元素
        const newVideo = document.createElement('video');
        newVideo.id = 'videoPlayer';
        container.appendChild(newVideo);

        const config = {
            id: 'videoPlayer',
            url: streamUrl,
            isLive: true,
            width: '100%',
            height: '100%',
            autoplay: true,
            fluid: true,
            cors: true,
            enableStallCheck: true,
            stallTime: 5,
            loadTimeout: 10,
            minCachedTime: 0.5,
            maxCachedTime: 1,
            flv: {
                cors: true,
                hasAudio: true,
                hasVideo: true,
                withCredentials: false,
                enableWorker: true,
                enableStashBuffer: false,
                stashInitialSize: 128,
                lazyLoadMaxDuration: 3 * 60
            }
        };

        // 创建播放器
        player = new FlvPlayer(config);

        // 监听事件
        player.on('error', (err) => {
            console.error('播放器错误:', err);
        });

        player.on('ready', () => {
            console.log('播放器就绪');
        });

        player.on('complete', () => {
            console.log('播放完成');
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

// 页面加载完成后获取默认播放地址
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

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
