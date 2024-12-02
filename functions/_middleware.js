export async function onRequest({ request, next, env }) {
    const url = new URL(request.url);
    
    // 允许访问登录页面和认证API
    if (url.pathname === '/login' || 
        url.pathname === '/login.html' || 
        url.pathname.startsWith('/_auth/') ||
        url.pathname.startsWith('/css/') ||
        url.pathname.startsWith('/js/')) {
        return next();
    }

    // 检查是否已登录
    const isLoggedIn = request.headers.get('Cookie')?.includes('auth=1');
    if (!isLoggedIn) {
        return Response.redirect(`${url.origin}/login`, 302);
    }

    return next();
}
