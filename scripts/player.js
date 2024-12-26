let flvPlayer = null;
let vjsPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
    if (vjsPlayer) {
        vjsPlayer.dispose();
        vjsPlayer = null;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('流地址:', streamUrl);
        console.log('是否为iOS设备:', isIOS());

        destroyPlayers();
        
        if (isIOS()) {
            console.log('检测到iOS设备，使用Video.js播放器');
            vjsPlayer = videojs('videoPlayer', {
                techOrder: ['html5', 'flvjs'],
                sources: [{
                    src: streamUrl,
                    type: 'video/x-flv'
                }],
                autoplay: true,
                controls: true,
                fluid: true,
                aspectRatio: '16:9',
                playsinline: true,
                flvjs: {
                    mediaDataSource: {
                        isLive: true,
                        cors: true,
                        withCredentials: false,
                    },
                },
            });

            // 监听错误事件
            vjsPlayer.on('error', function() {
                console.error('Video.js播放错误:', vjsPlayer.error());
            });

        } else if (window.flvjs && window.flvjs.isSupported()) {
            console.log('使用原生flv.js播放器');
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

            // 监听错误事件
            flvPlayer.on(window.flvjs.Events.ERROR, (errorType, errorDetail) => {
                console.error('FLV.js播放错误:', errorType, errorDetail);
            });

            videoElement.play().catch(e => {
                console.error('自动播放失败:', e);
            });
        } else {
            console.error('当前浏览器不支持 FLV 播放');
            alert('当前浏览器不支持 FLV 播放，请尝试使用其他浏览器');
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
