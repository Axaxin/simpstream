let flvPlayer = null;

// 页面加载完成后自动播放默认地址
window.onload = function() {
    play();
};

function initializePlayer(url) {
    if (flvPlayer) {
        flvPlayer.destroy();
    }

    const videoElement = document.getElementById('videoPlayer');
    
    if (url.endsWith('.flv') || url.startsWith('rtmp://')) {
        flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: url
        });
        flvPlayer.attachMediaElement(videoElement);
        flvPlayer.load();
        flvPlayer.play();
    } else if (url.endsWith('.m3u8')) {
        videoElement.src = url;
        videoElement.play();
    } else {
        alert('不支持的格式。请使用 FLV、RTMP 或 M3U8 地址。');
    }
}

function play() {
    const url = document.getElementById('streamUrl').value;
    if (!url) {
        alert('请输入播放地址');
        return;
    }
    initializePlayer(url);
}
