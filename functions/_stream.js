export async function onRequestGet(context) {
    try {
        return new Response(
            JSON.stringify({
                url: context.env.DEFAULT_STREAM_URL || ''
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
                error: 'Failed to get stream URL'
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
