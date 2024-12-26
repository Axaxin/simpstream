let flvPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 将 FLV 地址转换为 MP4 地址
function convertToMP4Url(url) {
    // 将 hdl/live/xxx.flv 转换为 fmp4/live/xxx.mp4
    return url.replace('/hdl/', '/fmp4/').replace('.flv', '.mp4');
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('原始流地址:', streamUrl);
        console.log('是否为iOS设备:', isIOS());

        destroyPlayers();
        
        if (isIOS()) {
            console.log('使用原生播放器(MP4)');
            const videoElement = document.getElementById('videoPlayer');
            const mp4Url = convertToMP4Url(streamUrl);
            console.log('MP4流地址:', mp4Url);
            
            // 重置视频元素
            videoElement.pause();
            videoElement.removeAttribute('src');
            videoElement.load();
            
            // 设置必要的属性
            videoElement.setAttribute('playsinline', '');  // 防止全屏
            videoElement.setAttribute('webkit-playsinline', '');  // iOS Safari
            videoElement.setAttribute('x5-playsinline', '');  // 微信浏览器
            
            // 设置缓冲和播放参数
            videoElement.preload = 'auto';  // 预加载
            videoElement.autoplay = true;   // 自动播放
            videoElement.muted = true;      // 默认静音，提高自动播放成功率
            
            // 设置缓冲策略
            videoElement.buffered;          // 激活缓冲区
            videoElement.preload = 'auto';  // 预加载视频
            
            // 设置播放策略
            videoElement.defaultPlaybackRate = 1.0;  // 播放速率
            videoElement.playbackRate = 1.0;
            
            // 监听缓冲事件
            videoElement.addEventListener('waiting', () => {
                console.log('视频缓冲中...');
            });
            
            videoElement.addEventListener('canplay', () => {
                console.log('视频可以播放');
                videoElement.play().catch(e => console.error('播放失败:', e));
            });
            
            // 设置视频源并添加时间戳防止缓存
            videoElement.src = `${mp4Url}?_t=${Date.now()}`;
            
            // 错误处理
            videoElement.onerror = function(e) {
                console.error('视频播放错误:', e);
                console.error('错误代码:', videoElement.error.code);
                console.error('错误信息:', videoElement.error.message);
                alert('播放出错，请刷新页面重试');
            };
            
            // 尝试播放
            try {
                // 先加载一些数据
                await new Promise((resolve) => {
                    videoElement.addEventListener('loadedmetadata', resolve, { once: true });
                    setTimeout(resolve, 5000); // 5秒超时
                });
                
                await videoElement.play();
                console.log('播放开始');
                
                // 取消静音（如果自动播放成功）
                videoElement.muted = false;
            } catch (e) {
                console.error('自动播放失败:', e);
                // 保持静音并重试
                videoElement.muted = true;
                videoElement.play().catch(e => console.error('静音播放也失败:', e));
            }

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

async function loadDefaultStreamUrl() {
    console.log('加载默认流地址');
    try {
        const response = await fetch('/_stream');
        const data = await response.json();
        if (data.url) {
            console.log('获取到默认流地址:', data.url);
            document.getElementById('streamUrl').value = data.url;
            await initPlayer(data.url);  // 直接初始化播放器
        }
    } catch (error) {
        console.error('加载默认流地址失败:', error);
    }
}

// 页面加载完成后加载默认流地址
document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载前销毁播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
