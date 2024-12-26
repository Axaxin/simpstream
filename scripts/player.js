let peerConnection = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function destroyPlayers() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
}

async function initWebRTC(videoElement, streamUrl) {
    try {
        // 将FLV URL转换为WebRTC URL
        const webrtcUrl = streamUrl
            .replace(/^https?:\/\//, 'webrtc://')
            .replace('/hdl/', '/webrtc/play/')
            .replace('.flv', '');

        console.log('WebRTC URL:', webrtcUrl);

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
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
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

    try {
        await initWebRTC(videoElement, streamUrl);
        // 自动播放
        try {
            await videoElement.play();
        } catch (playError) {
            console.warn('自动播放失败，可能需要用户交互:', playError);
        }
    } catch (error) {
        console.error('播放失败:', error);
    }
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
