let peerConnection = null;

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

        // 解析WebRTC URL获取streamPath
        const url = new URL(streamUrl);
        const streamPath = url.pathname.split('/').slice(3).join('/');
        console.log('Stream Path:', streamPath);

        // 构建API URL (使用https)
        const apiUrl = `https://${url.host}/webrtc/play/${streamPath}`;
        console.log('API URL:', apiUrl);

        // 创建新的RTCPeerConnection
        peerConnection = new RTCPeerConnection();
        console.log('RTCPeerConnection已创建');

        // 监听ICE候选者
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                console.log('发现新的ICE候选者:', event.candidate);
            }
        };

        // 监听连接状态
        peerConnection.onconnectionstatechange = () => {
            console.log('连接状态:', peerConnection.connectionState);
        };

        // 处理远程流
        peerConnection.ontrack = (event) => {
            console.log('收到媒体流');
            if (event.streams && event.streams[0]) {
                videoElement.srcObject = event.streams[0];
            }
        };

        // 发送SDP请求
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sdp'
            }
        });

        if (!response.ok) {
            throw new Error(`服务器响应错误: ${response.status}`);
        }

        // 获取服务器返回的SDP
        const sdp = await response.text();
        console.log('收到服务器SDP');

        // 设置远程描述
        await peerConnection.setRemoteDescription(new RTCSessionDescription({
            type: 'offer',
            sdp: sdp
        }));

        // 创建应答
        const answer = await peerConnection.createAnswer();
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
            // 将 http URL 转换为 webrtc URL
            const webrtcUrl = data.url
                .replace(/^https?:\/\//, 'webrtc://')
                .replace('/hdl/', '/webrtc/play/')
                .replace('.flv', '');
            console.log('WebRTC URL:', webrtcUrl);
            document.getElementById('streamUrl').value = webrtcUrl;
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
