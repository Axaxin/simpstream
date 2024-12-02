export async function onRequest({ request, next, env }) {
    const url = new URL(request.url);
    
    // 静态资源直接放行
    if (url.pathname.startsWith('/css/') ||
        url.pathname.startsWith('/js/') ||
        url.pathname.endsWith('.ico') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.JPG')) {
        return next();
    }

    // 处理登录相关请求
    if (url.pathname.startsWith('/_auth/')) {
        return next();
    }

    // 处理登录页面
    if (url.pathname === '/login') {
        const isLoggedIn = request.headers.get('Cookie')?.includes('auth=1');
        if (isLoggedIn) {
            return Response.redirect(`${url.origin}/`, 302);
        }
        const response = await fetch(new URL('/login.html', url));
        return new Response(response.body, response);
    }

    // 检查其他页面的登录状态
    const isLoggedIn = request.headers.get('Cookie')?.includes('auth=1');
    if (!isLoggedIn && url.pathname !== '/login.html') {
        return Response.redirect(`${url.origin}/login`, 302);
    }

    // 处理根路径
    if (url.pathname === '/') {
        const response = await fetch(new URL('/index.html', url));
        return new Response(response.body, response);
    }

    return next();
}
