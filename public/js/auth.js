function login() {
    const password = document.getElementById('password').value;
    if (password === 'your-password') {  // 替换为你的密码
        localStorage.setItem('auth', '1');
        window.location.href = '/';
    } else {
        alert('密码错误');
    }
}

function logout() {
    localStorage.removeItem('auth');
    window.location.href = '/login.html';
}

// 检查登录状态
function checkAuth() {
    const isLoggedIn = localStorage.getItem('auth') === '1';
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (!isLoggedIn && !isLoginPage) {
        window.location.href = '/login.html';
    } else if (isLoggedIn && isLoginPage) {
        window.location.href = '/';
    }
}

// 在页面加载时检查登录状态
window.addEventListener('load', checkAuth);

// 添加回车键支持
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
});
