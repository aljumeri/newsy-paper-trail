# Newsletter Edge Function Deployment

This package contains the updated Edge Function for the newsletter sending functionality.

## Deployment Instructions

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Navigate to your project
3. Go to Edge Functions section
4. Select the `send-newsletter` function
5. Click on "Deploy" or "Update"
6. Upload the `index.ts` file from the `send-newsletter` folder

## Environment Variables

Make sure the following environment variables are set for the Edge Function:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (with admin access)

You can set these in the Supabase dashboard under Edge Functions > send-newsletter > Settings > Environment Variables.

## Testing

After deployment, you can test the function by:

1. Going to your admin panel
2. Creating a new newsletter
3. Clicking the "Send" button

## Troubleshooting

If you encounter the Arabic error message:

```
خطأ
حدث خطأ أثناء الاشتراك يرجى المحاولة مرة أخرى لاحقا.
```

This indicates an authentication or permission issue. Check:

1. That your Edge Function has the correct environment variables
2. That you're logged in as an admin user when trying to send newsletters
3. That the RLS policies for the `subscribers` table are correctly set

You can also check the Edge Function logs in the Supabase dashboard for more detailed error information. 