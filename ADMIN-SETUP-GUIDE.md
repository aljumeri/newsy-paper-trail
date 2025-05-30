# Admin Dashboard Setup Guide

This guide provides solutions to common issues with the Newsy Paper Trail admin dashboard.

## 1. Authentication Issues

### Admin Access

Only specific email addresses are allowed to access the admin dashboard:
- Any email ending with `@solo4ai.com`
- `aljumeri@gmail.com`
- `su.alshehri.ai@gmail.com`
- `admin@example.com`
- `test@example.com`
- `padebayo236@gmail.com`

### Adding New Admin Emails

To add a new admin email, use the Supabase SQL Editor to run:

```sql
-- Add new admin email to approved list
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Updated implementation with new admin email
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND (
      email LIKE '%@solo4ai.com' OR
      email LIKE '%admin%' OR
      email = 'aljumeri@gmail.com' OR
      email = 'su.alshehri.ai@gmail.com' OR
      email = 'admin@example.com' OR
      email = 'test@example.com' OR
      email = 'padebayo236@gmail.com'
      -- Add new emails here
    )
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_user(UUID) TO authenticated;
```

## 2. Reset Password Issues

If the password reset functionality isn't working:

1. Check Supabase Authentication Settings:
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Ensure the "Reset Password" template is properly configured
   - Make sure the redirect URL is set to your application's domain

2. Update the site URL in Supabase:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Set the Site URL to your application's URL (e.g., https://yourdomain.com)

## 3. Newsletter View/Edit Navigation Issues

If viewing or editing newsletters leads to errors, the issue is with the routing. Make sure your router has routes defined for:

- `/admin-control/newsletter/view/:id`
- `/admin-control/newsletter/edit/:id`

## 4. Newsletter Sending Functionality

### Deploy the Fixed Edge Functions

1. Download the deployment packages:
   - `fixed-send-newsletter-function.zip` for the newsletter sending function
   - `fixed-add-subscriber-function.zip` for the subscriber registration function
   - `deploy-package/unsubscribe` for the unsubscribe functionality

2. Go to Supabase Dashboard → Edge Functions

3. For each function:
   - Select the function or create a new one with the appropriate name
   - Upload the corresponding zip file
   - If creating a function, use `send-newsletter`, `add-subscriber`, or `unsubscribe` as the name

### Set Environment Variables

For each Edge Function in the Supabase Dashboard → Edge Functions → [function name] → Settings, add:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (found in Project Settings → API)
- `UNSUBSCRIBE_SECRET`: A secret key for generating secure unsubscribe tokens (can be any random string)

### Test the Edge Function

Run the included test script after setting your Supabase key:
```bash
# Windows/PowerShell
$env:SUPABASE_KEY="your_anon_key_here"; node test-newsletter-function.js

# Mac/Linux
SUPABASE_KEY="your_anon_key_here" node test-newsletter-function.js
```

## 5. Unsubscribe Functionality

The project now includes an unsubscribe feature that allows subscribers to remove themselves from the newsletter list.

### How It Works

1. Each newsletter email includes an unsubscribe link at the bottom
2. The link contains the subscriber's email and a security token
3. When clicked, the user is taken to the unsubscribe page where they confirm their choice
4. After confirmation, the Edge Function removes them from the database

### Deploying the Unsubscribe Function

1. Deploy the unsubscribe Edge Function:
   - Use the code in `deploy-package/unsubscribe`
   - Create a new Edge Function named `unsubscribe` in Supabase

2. Set the required environment variables:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key
   - `UNSUBSCRIBE_SECRET`: A secret key for token generation (must match the one used in the send-newsletter function)

3. Test the unsubscribe functionality:
   - Send a test newsletter to your email
   - Click the unsubscribe link at the bottom
   - Confirm that you're redirected to the unsubscribe page
   - Verify the subscriber is removed from the database after confirmation

### Customizing the Unsubscribe Page

The unsubscribe page (`src/pages/Unsubscribe.tsx`) can be customized to match your branding:
- Change the text and styling
- Add your logo or branding elements
- Modify the confirmation message

## Troubleshooting

### 1. Clear Browser Cache

If you're still experiencing issues after making changes:
- Clear your browser cache
- Try in incognito/private browsing mode
- Restart your application

### 2. Check Console Logs

Browser developer tools (F12) can provide valuable error information.

### 3. Enable Debug Mode

Add `?debug=true` to your URL to enable additional logging.

### 4. Manual Deployment

If you can't deploy directly to Supabase via the CLI:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the SQL scripts from this guide
3. Execute them to update your database 