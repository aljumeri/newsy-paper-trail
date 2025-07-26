import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-domain',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const sendyUrl = Deno.env.get('SENDY_URL')
    const sendyApiKey = Deno.env.get('SENDY_API_KEY')
    const sendyListId = Deno.env.get('SENDY_LIST_ID')

    if (!sendyUrl || !sendyApiKey || !sendyListId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Sendy configuration missing'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      })
    }

    // Prepare form data for Sendy API
    const formData = new URLSearchParams()
    formData.append('api_key', sendyApiKey)
    formData.append('list_id', sendyListId)

    // Make request to Sendy API
    const response = await fetch(`${sendyUrl}/api/subscribers/active-subscriber-count.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Sendy API error: ${response.status}`)
    }

    const data = await response.json()
    
    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    })

  } catch (error) {
    console.error('Error fetching Sendy data:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch Sendy data',
      details: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    })
  }
}) 