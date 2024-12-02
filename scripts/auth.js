// 检查是否已登录
function isLoggedIn() {
    return localStorage.getItem('auth') === '1';
}

// 简单的登录验证
function login() {
    const password = document.getElementById('password').value;
    
    // 使用环境变量中的密码进行验证
    fetch('/_auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('auth', '1');
            window.location.href = '/';
        } else {
            alert('密码错误');
        }
    })
    .catch(() => {
        alert('验证失败，请重试');
    });
}

// 登出
function logout() {
    localStorage.removeItem('auth');
    window.location.href = '/login.html';
}

// 在主页面检查登录状态
if (window.location.pathname === '/') {
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
    }
}

// 在登录页面检查登录状态
if (window.location.pathname === '/login.html') {
    if (isLoggedIn()) {
        window.location.href = '/';
    }
}

// 设置登录表单事件监听
function setupLoginForm() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
}

// 仅在页面完全加载后执行一次验证
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setupLoginForm();
    });
} else {
    setupLoginForm();
}
