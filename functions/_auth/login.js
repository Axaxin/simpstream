export async function onRequestPost({ request, env }) {
    const { password } = await request.json();
    
    if (password === env.AUTH_PASSWORD) {
        return new Response('OK', {
            headers: {
                'Set-Cookie': 'auth=1; Path=/; HttpOnly; SameSite=Lax',
                'Content-Type': 'text/plain'
            }
        });
    }
    
    return new Response('Invalid password', { status: 401 });
}
