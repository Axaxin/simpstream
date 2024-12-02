export async function onRequestPost() {
    return new Response('OK', {
        headers: {
            'Set-Cookie': 'auth=1; Path=/; Max-Age=0; HttpOnly; SameSite=Lax',
            'Content-Type': 'text/plain'
        }
    });
}
