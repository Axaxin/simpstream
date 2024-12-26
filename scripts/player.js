let flvPlayer = null;
let xgPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
    if (xgPlayer) {
        xgPlayer.destroy();
        xgPlayer = null;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('流地址:', streamUrl);
        console.log('是否为iOS设备:', isIOS());

        destroyPlayers();
        
        if (isIOS()) {
            console.log('使用xgplayer播放器');
            
            // 创建xgplayer实例
            xgPlayer = new Player({
                id: 'videoPlayer',
                url: streamUrl,
                playsinline: true,
                fluid: true,
                height: '100%',
                width: '100%',
                autoplay: true,
                isLive: true,
                cors: true,
                enableContextmenu: false,
                plugins: [StreamingMedia],
                streamingMedia: {
                    protocol: 'flv',
                    decoder: 'wasm',
                }
            });

            // 错误处理
            xgPlayer.on('error', (err) => {
                console.error('xgplayer错误:', err);
                alert('播放出错，请刷新页面重试');
            });

        } else if (window.flvjs && window.flvjs.isSupported()) {
            console.log('使用flv.js播放器');
            const videoElement = document.getElementById('videoPlayer');
            
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
            flvPlayer.play();
        } else {
            console.error('当前浏览器不支持视频播放');
            alert('当前浏览器不支持视频播放，请尝试使用其他浏览器');
        }

        console.log('播放器初始化完成');
    } catch (error) {
        console.error('播放器初始化失败:', error);
        alert('播放器初始化失败，请刷新页面重试');
        throw error;
    }
}

async function play() {
    const streamUrl = document.getElementById('streamUrl').value;
    if (!streamUrl) {
        console.warn('未提供流地址');
        return;
    }
    await initPlayer(streamUrl);
}

// 页面加载完成后检查默认地址
document.addEventListener('DOMContentLoaded', function() {
    const defaultUrl = localStorage.getItem('defaultStreamUrl');
    if (defaultUrl) {
        document.getElementById('streamUrl').value = defaultUrl;
    }
});

// 页面卸载前销毁播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
