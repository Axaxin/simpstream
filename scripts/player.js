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
        player = new Player({
            id: 'videoPlayer',
            url: streamUrl,  // 直接设置url
            isLive: true,
            autoplay: false, // 禁用自动播放，改为手动控制
            fluid: true,
            width: '100%',
            height: '100%',
            volume: 1,
            plugins: [{
                plugin: Player.FlvPlayer,
                options: {
                    type: 'flv',  // 指定类型
                    cors: true,   // 允许跨域
                    hasAudio: true,
                    hasVideo: true,
                    enableWorker: true,
                    isLive: true,
                    lazyLoad: false,
                    enableStashBuffer: false,
                    stashInitialSize: 128
                }
            }]
        });

        // 事件监听
        player.on('error', (err) => {
            console.error('播放器错误:', err);
            // 尝试重新加载
            setTimeout(() => {
                console.log('尝试重新加载...');
                player.reload();
            }, 1000);
        });

        player.on('ready', () => {
            console.log('播放器就绪');
            // 添加播放按钮
            const playButton = document.createElement('button');
            playButton.textContent = '点击播放';
            playButton.style.position = 'absolute';
            playButton.style.top = '50%';
            playButton.style.left = '50%';
            playButton.style.transform = 'translate(-50%, -50%)';
            playButton.style.zIndex = '1000';
            playerContainer.appendChild(playButton);

            playButton.onclick = async () => {
                try {
                    await player.play();
                    playButton.remove();
                } catch (e) {
                    console.error('播放失败:', e);
                }
            };
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
