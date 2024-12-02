export async function onRequestPost(context) {
    try {
        const { password } = await context.request.json();
        const correctPassword = context.env.AUTH_PASSWORD;

        return new Response(
            JSON.stringify({
                success: password === correctPassword
            }),
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Invalid request'
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
