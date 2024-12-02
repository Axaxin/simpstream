// 简单的登录验证
function login() {
    const password = document.getElementById('password').value;
    if (!password) {
        alert('请输入密码');
        return;
    }
    
    // 使用环境变量中的密码进行验证
    fetch('/_auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('auth', '1');
            window.location.replace('/');
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
    window.location.replace('/login.html');
}

// 检查登录状态
function checkAuth() {
    const isLoggedIn = localStorage.getItem('auth') === '1';
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    if (!isLoggedIn && !isLoginPage) {
        window.location.replace('/login.html');
    } else if (isLoggedIn && isLoginPage) {
        window.location.replace('/');
    }
}

// 页面加载时检查登录状态并设置事件监听
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                login();
            }
        });
    }
});
