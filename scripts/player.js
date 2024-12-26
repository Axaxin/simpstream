let peerConnection = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function destroyPlayers() {
    if (peerConnection) {
        console.log('清理之前的连接');
        peerConnection.close();
        peerConnection = null;
    }
}

async function initWebRTC(videoElement, streamUrl) {
    try {
        console.log('原始URL:', streamUrl);
        
        // 将FLV URL转换为WebRTC URL
        const webrtcUrl = streamUrl
            .replace(/^https?:\/\//, 'webrtc://')
            .replace('/hdl/', '/webrtc/play/')
            .replace('.flv', '');

        console.log('转换后的WebRTC URL:', webrtcUrl);
        console.log('实际请求的HTTP URL:', webrtcUrl.replace('webrtc://', 'https://'));

        // 创建新的RTCPeerConnection
        peerConnection = new RTCPeerConnection();
        console.log('RTCPeerConnection已创建');

        // 监听连接状态变化
        peerConnection.onconnectionstatechange = (event) => {
            console.log('连接状态变化:', peerConnection.connectionState);
        };

        // 监听ICE连接状态
        peerConnection.oniceconnectionstatechange = (event) => {
            console.log('ICE连接状态:', peerConnection.iceConnectionState);
        };

        // 监听信令状态
        peerConnection.onsignalingstatechange = (event) => {
            console.log('信令状态:', peerConnection.signalingState);
        };

        // 处理远程流
        peerConnection.ontrack = (event) => {
            console.log('收到媒体流轨道');
            if (event.streams && event.streams[0]) {
                console.log('设置视频源');
                videoElement.srcObject = event.streams[0];
            }
        };

        // 连接WebRTC
        console.log('开始获取WebRTC offer...');
        const response = await fetch(webrtcUrl.replace('webrtc://', 'https://'));
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const offer = await response.json();
        console.log('收到offer:', offer);
        
        console.log('设置远程描述...');
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        console.log('创建answer...');
        const answer = await peerConnection.createAnswer();
        
        console.log('设置本地描述...');
        await peerConnection.setLocalDescription(answer);

        console.log('WebRTC连接已建立');
    } catch (error) {
        console.error('WebRTC初始化失败:', error);
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

    console.log('准备初始化WebRTC...');
    try {
        await initWebRTC(videoElement, streamUrl);
        // 自动播放
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

document.addEventListener('DOMContentLoaded', loadDefaultStreamUrl);

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    destroyPlayers();
});
