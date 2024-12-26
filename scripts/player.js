let flvPlayer = null;
let jessibucaPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
    if (jessibucaPlayer) {
        jessibucaPlayer.destroy();
        jessibucaPlayer = null;
    }
}

function play() {
    destroyPlayers();

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    if (!streamUrl) {
        return;
    }

    // iPhone设备使用Jessibuca播放器
    if (isIOS()) {
        console.log('iOS设备检测到，初始化Jessibuca播放器');
        
        // 保存video元素的父容器
        const container = videoElement.parentElement;
        // 移除原有的video元素
        videoElement.remove();
        
        // 创建新的播放器容器
        const playerContainer = document.createElement('div');
        playerContainer.id = 'jessibucaPlayer';
        playerContainer.style.width = '100%';
        playerContainer.style.height = '400px'; // 设置固定高度
        container.appendChild(playerContainer);

        try {
            console.log('创建Jessibuca实例');
            jessibucaPlayer = new window.Jessibuca({
                container: playerContainer,
                videoBuffer: 0.2,
                isResize: true,
                debug: true, // 开启调试模式
                hotKey: false,
                loadingText: '加载中...',
                background: '#000000',
                decoder: '/scripts/decoder.js'
            });

            // 添加事件监听
            jessibucaPlayer.on('error', (error) => {
                console.error('Jessibuca播放器错误:', error);
            });

            jessibucaPlayer.on('load', () => {
                console.log('Jessibuca解码器加载成功');
            });

            jessibucaPlayer.on('play', () => {
                console.log('Jessibuca开始播放');
            });

            console.log('开始播放流:', streamUrl);
            jessibucaPlayer.play(streamUrl);
        } catch (error) {
            console.error('Jessibuca初始化失败:', error);
            // 发生错误时恢复video元素
            container.appendChild(videoElement);
        }
        return;
    }

    // 其他设备使用flv.js
    flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: streamUrl
    });
    
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();
}

// 页面加载完成后获取默认播放地址
async function loadDefaultStreamUrl() {
    try {
        const response = await fetch('/_stream');
        const data = await response.json();
        if (data.url) {
            document.getElementById('streamUrl').value = data.url;
            play();
        }
    } catch (error) {
        console.error('Failed to load default stream URL');
    }
}

document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
