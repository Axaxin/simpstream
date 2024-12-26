let flvPlayer = null;
let jessibucaPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 从环境变量获取默认播放地址
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

function play() {
    // 清理现有播放器
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
    if (jessibucaPlayer) {
        jessibucaPlayer.destroy();
        jessibucaPlayer = null;
    }

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    if (!streamUrl) {
        return;
    }

    // iOS设备使用jessibuca播放器
    if (isIOS()) {
        // 隐藏原生video标签
        videoElement.style.display = 'none';
        
        // 创建jessibuca容器
        let jessibucaContainer = document.getElementById('jessibucaContainer');
        if (!jessibucaContainer) {
            jessibucaContainer = document.createElement('div');
            jessibucaContainer.id = 'jessibucaContainer';
            videoElement.parentNode.insertBefore(jessibucaContainer, videoElement);
        } else {
            jessibucaContainer.style.display = 'block';
        }
        
        jessibucaPlayer = new Jessibuca({
            container: jessibucaContainer,
            videoBuffer: 0.2, // 用于直播
            isResize: true,
            text: '正在加载播放器...',
            loadingText: '正在加载视频...',
            debug: false,
            hotKey: false,
            autoWasm: true,
            heartTimeout: 5
        });
        
        jessibucaPlayer.play(streamUrl);
        return;
    }

    // 其他设备使用flv.js
    videoElement.style.display = 'block';
    if (document.getElementById('jessibucaContainer')) {
        document.getElementById('jessibucaContainer').style.display = 'none';
    }
    
    flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: streamUrl
    });
    
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();
}

// 页面加载完成后获取默认播放地址
document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    if (flvPlayer) {
        flvPlayer.destroy();
    }
    if (jessibucaPlayer) {
        jessibucaPlayer.destroy();
    }
});
