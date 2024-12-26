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
        
        if (mpegts.getFeatureList().mseLivePlayback) {
            console.log('当前浏览器支持MSE直播回放');
        }

        player = mpegts.createPlayer({
            type: 'flv',  // 或者 'mse'
            url: streamUrl,
            isLive: true,
            cors: true,
            hasAudio: true,
            hasVideo: true,
            enableStashBuffer: false, // 实时性优先
            liveBufferLatencyChasing: true, // 追赶延迟
            autoCleanupSourceBuffer: true,
            stashInitialSize: 128,   // 减小初始缓冲区大小
            lazyLoad: false,
            fixAudioTimestampGap: true
        });

        player.attachMediaElement(videoElement);
        player.load();

        // 监听事件
        player.on(mpegts.Events.ERROR, (errorType, errorDetail) => {
            console.error('播放器错误:', errorType, errorDetail);
        });

        player.on(mpegts.Events.STATISTICS_INFO, (stats) => {
            console.log('播放器统计:', stats);
        });

        await player.play();
        console.log('播放器初始化完成');
    } catch (error) {
        console.error('播放器初始化失败:', error);
        throw error;
    }
}

async function play() {
    console.log('开始播放流程');
    destroyPlayers();

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    if (!streamUrl) {
        console.warn('未提供流地址');
        return;
    }

    try {
        await initPlayer(videoElement, streamUrl);
        try {
            console.log('尝试自动播放...');
            await videoElement.play();
            console.log('自动播放成功');
        } catch (playError) {
            console.warn('自动播放失败，可能需要用户交互:', playError);
        }
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

// 检查浏览器兼容性
function checkCompatibility() {
    if (!mpegts.isSupported()) {
        console.error('当前浏览器不支持mpegts.js');
        alert('您的浏览器不支持当前播放器，请使用最新版本的Chrome、Firefox或Safari浏览器。');
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    if (checkCompatibility()) {
        loadDefaultStreamUrl();
    }
});

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
