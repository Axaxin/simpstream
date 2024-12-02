async function login() {
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/_auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        if (response.ok) {
            location.href = '/';
        } else {
            alert('密码错误');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('登录失败，请重试');
    }
}

async function logout() {
    try {
        await fetch('/_auth/logout', { method: 'POST' });
        location.href = '/login';
    } catch (error) {
        console.error('Logout error:', error);
        alert('登出失败，请重试');
    }
}

// 添加回车键支持
document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') login();
        });
    }
});
