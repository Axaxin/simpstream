export async function onRequest({ request, next, env }) {
    const url = new URL(request.url);
    
    // 静态资源和API路径直接放行
    if (url.pathname.startsWith('/_auth/') ||
        url.pathname.startsWith('/css/') ||
        url.pathname.startsWith('/js/') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.JPG')) {
        return next();
    }

    // 处理登录页面
    if (url.pathname === '/login' || url.pathname === '/login.html') {
        const isLoggedIn = request.headers.get('Cookie')?.includes('auth=1');
        if (isLoggedIn) {
            return Response.redirect(`${url.origin}/`, 302);
        }
        return next();
    }

    // 检查其他页面的登录状态
    const isLoggedIn = request.headers.get('Cookie')?.includes('auth=1');
    if (!isLoggedIn) {
        return Response.redirect(`${url.origin}/login`, 302);
    }

    return next();
}
