// 简单的登录验证
function login() {
    const password = document.getElementById('password');
    if (!password || !password.value) {
        alert('请输入密码');
        return;
    }
    
    // 使用环境变量中的密码进行验证
    fetch('/_auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.value })
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

// 检查登录状态
function checkAuth() {
    const auth = localStorage.getItem('auth');
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath === '/login.html';

    // 未登录且不在登录页，跳转到登录页
    if (!auth && !isLoginPage) {
        window.location.href = '/login.html';
        return;
    }

    // 已登录且在登录页，跳转到主页
    if (auth && isLoginPage) {
        window.location.href = '/';
        return;
    }
}

// 仅在页面完全加载后执行一次验证
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        checkAuth();
        setupLoginForm();
    });
} else {
    checkAuth();
    setupLoginForm();
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
