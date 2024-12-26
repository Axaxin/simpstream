let flvPlayer = null;
let peerConnection = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function destroyPlayers() {
    if (flvPlayer) {
        flvPlayer.destroy();
        flvPlayer = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
}

async function initWebRTC(videoElement, streamUrl) {
    try {
        // 将FLV URL转换为WebRTC URL
        // 例如: https://winlive.metacorn.cc/hdl/live/win.flv -> webrtc://winlive.metacorn.cc/webrtc/play/live/win
        const webrtcUrl = streamUrl
            .replace(/^https?:\/\//, 'webrtc://')  // 替换协议
            .replace('/hdl/', '/webrtc/play/')     // 替换路径
            .replace('.flv', '');                  // 移除扩展名

        // 创建新的RTCPeerConnection
        peerConnection = new RTCPeerConnection();

        // 处理远程流
        peerConnection.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                videoElement.srcObject = event.streams[0];
            }
        };

        // 连接WebRTC
        const response = await fetch(webrtcUrl.replace('webrtc://', 'https://'));
        const offer = await response.json();
        
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('WebRTC连接已建立');
    } catch (error) {
        console.error('WebRTC初始化失败:', error);
        throw error;
    }
}

async function play() {
    destroyPlayers();

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    if (!streamUrl) {
        return;
    }

    // iPhone设备使用WebRTC
    if (isIOS()) {
        try {
            await initWebRTC(videoElement, streamUrl);
            return;
        } catch (error) {
            console.error('WebRTC播放失败:', error);
        }
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
