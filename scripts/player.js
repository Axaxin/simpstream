let flvPlayer = null;

function play() {
    if (flvPlayer) {
        flvPlayer.destroy();
    }

    const videoElement = document.getElementById('videoPlayer');
    const streamUrl = document.getElementById('streamUrl').value;

    flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: streamUrl
    });
    
    flvPlayer.attachMediaElement(videoElement);
    flvPlayer.load();
    flvPlayer.play();
}

// 页面卸载时清理播放器
window.addEventListener('beforeunload', function() {
    if (flvPlayer) {
        flvPlayer.destroy();
    }
});
