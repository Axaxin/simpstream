let flvPlayer = null;
let peerConnection = null;

// 检测是否为iOS设备
function isIOS() {
    return /iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

// 将 FLV 地址转换为 WebRTC 地址
function convertToWebRTCUrl(url) {
    // 将 hdl/live/xxx.flv 转换为 webrtc/play/live/xxx
    return url.replace('/hdl/', '/webrtc/play/').replace('.flv', '');
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

async function initWebRTCPlayer(streamUrl) {
    console.log('初始化WebRTC播放器...');
    
    // 创建新的 RTCPeerConnection
    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' }
        ]
    };
    
    peerConnection = new RTCPeerConnection(configuration);
    
    // 添加视频轨道
    const videoElement = document.getElementById('videoPlayer');
    peerConnection.ontrack = (event) => {
        console.log('收到媒体轨道');
        if (event.streams && event.streams[0]) {
            videoElement.srcObject = event.streams[0];
        }
    };
    
    // 创建 offer
    const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    });
    await peerConnection.setLocalDescription(offer);
    
    // 发送 offer 到服务器并获取 answer
    try {
        const webrtcUrl = convertToWebRTCUrl(streamUrl);
        console.log('WebRTC URL:', webrtcUrl);
        
        const response = await fetch(webrtcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/sdp'
            },
            body: offer.sdp
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const answerSDP = await response.text();
        const answer = new RTCSessionDescription({
            type: 'answer',
            sdp: answerSDP
        });
        
        await peerConnection.setRemoteDescription(answer);
        console.log('WebRTC 连接建立成功');
        
        // 设置视频元素属性
        videoElement.setAttribute('playsinline', '');
        videoElement.setAttribute('webkit-playsinline', '');
        videoElement.setAttribute('x5-playsinline', '');
        videoElement.muted = true;
        
        try {
            await videoElement.play();
            console.log('播放开始');
            videoElement.muted = false;
        } catch (e) {
            console.error('自动播放失败:', e);
            // 保持静音并重试
            videoElement.muted = true;
            videoElement.play().catch(e => console.error('静音播放也失败:', e));
        }
        
    } catch (error) {
        console.error('WebRTC 连接失败:', error);
        throw error;
    }
}

async function initPlayer(streamUrl) {
    try {
        console.log('初始化播放器...');
        console.log('原始流地址:', streamUrl);
        console.log('是否为iOS设备:', isIOS());

        destroyPlayers();
        
        if (isIOS()) {
            console.log('使用WebRTC播放器');
            await initWebRTCPlayer(streamUrl);
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
