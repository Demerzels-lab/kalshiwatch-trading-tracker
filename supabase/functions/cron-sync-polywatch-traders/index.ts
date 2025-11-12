// Edge Function: Cron - Sync PolyWatch Traders
// Scheduled cron job to sync trader data every 6 hours
// No JWT validation required for cron jobs

Deno.serve(async () => {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        console.log('Starting scheduled PolyWatch trader sync...');

        // Call the main sync function
        const syncResponse = await fetch(
            `${supabaseUrl}/functions/v1/sync-polywatch-traders`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            }
        );

        const syncResult = await syncResponse.json();

        console.log('Sync completed:', syncResult);

        return new Response(JSON.stringify({
            success: true,
            cron_job: 'sync-polywatch-traders',
            timestamp: new Date().toISOString(),
            sync_result: syncResult
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Cron job error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'CRON_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});
