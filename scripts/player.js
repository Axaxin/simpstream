let flvPlayer = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
}

// 获取流地址
async function getStreamUrl(isHLS = false) {
    try {
        // 从环境变量获取基础FLV地址
        const response = await fetch('/_stream');
        const data = await response.json();
        const flvUrl = data.url || 'https://winlive.metacorn.cc/hdl/live/win.flv';
        
        if (isHLS) {
            // 将FLV地址转换为HLS地址
            return flvUrl
                .replace('/hdl/', '/hls/')
                .replace('.flv', '.m3u8');
        }
        
        return flvUrl;
    } catch (error) {
        console.error('获取流地址失败:', error);
        // 使用默认地址作为后备
        const defaultUrl = 'https://winlive.metacorn.cc/hdl/live/win.flv';
        return isHLS ? defaultUrl.replace('/hdl/', '/hls/').replace('.flv', '.m3u8') : defaultUrl;
    }
}

async function initPlayer(streamUrl) {
    const videoElement = document.getElementById('videoPlayer');
    
    // 设置视频元素属性
    videoElement.setAttribute('playsinline', '');
    videoElement.setAttribute('webkit-playsinline', '');
    videoElement.setAttribute('x5-playsinline', '');
    
    // 销毁现有播放器
    destroyPlayers();
    
    if (isIOS()) {
        console.log('使用原生HLS播放器');
        videoElement.src = streamUrl;  
        try {
            await videoElement.play();
        } catch (error) {
            console.error('播放失败:', error);
        }
    } else {
        console.log('使用FLV.js播放器');
        if (flv.isSupported()) {
            flvPlayer = flv.createPlayer({
                type: 'flv',
                url: streamUrl,  
                isLive: true
            });
            flvPlayer.attachMediaElement(videoElement);
            flvPlayer.load();
            try {
                await flvPlayer.play();
            } catch (error) {
                console.error('播放失败:', error);
            }
        } else {
            console.error('您的浏览器不支持FLV播放');
        }
    }
}

async function play() {
    let streamUrl = document.getElementById('streamUrl').value;
    if (!streamUrl) {
        // 如果输入框为空，获取默认地址
        streamUrl = await getStreamUrl();
        document.getElementById('streamUrl').value = streamUrl;
    }
    
    // 根据设备类型转换地址格式
    if (isIOS()) {
        streamUrl = streamUrl.replace('/hdl/', '/hls/').replace('.flv', '.m3u8');
    }
    
    await initPlayer(streamUrl);
}

async function loadDefaultStreamUrl() {
    const defaultUrl = await getStreamUrl();
    document.getElementById('streamUrl').value = defaultUrl;
    await initPlayer(defaultUrl);
}

// 页面加载完成后加载默认流地址
document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载前销毁播放器
window.addEventListener('beforeunload', () => {
    destroyPlayers();
});
