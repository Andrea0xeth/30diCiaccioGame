// Implementazione manuale di Web Push per Deno
// Basata su RFC 8030 (Web Push Protocol)

import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

// Converti base64 URL safe a Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Converti Uint8Array a base64 URL safe
function uint8ArrayToUrlBase64(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array))
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// Genera JWT per VAPID
async function generateVAPIDJWT(
  privateKey: string,
  audience: string
): Promise<string> {
  // NOTA: Implementazione semplificata
  // Per una implementazione completa, serve una libreria JWT compatibile con Deno
  // Per ora, usiamo un approccio semplificato
  
  const header = {
    alg: 'ES256',
    typ: 'JWT'
  }
  
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 ore
    sub: 'mailto:admin@30diciaccio.it'
  }
  
  // Per una implementazione completa, serve firmare con ES256
  // Per ora, restituiamo un placeholder
  // In produzione, usa una libreria JWT compatibile con Deno
  
  throw new Error('JWT generation not fully implemented. Use a Deno-compatible JWT library.')
}

// Invia notifica push usando fetch nativo
export async function sendPushNotification(
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<void> {
  // Estrai l'audience dall'endpoint
  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`
  
  // Genera JWT VAPID (semplificato - in produzione usa una libreria JWT)
  // Per ora, proviamo senza JWT per vedere se funziona
  const vapidHeader = `vapid t=${vapidPublicKey},k=${vapidPublicKey}`
  
  // Prepara il payload cifrato (semplificato)
  // In una implementazione completa, devi cifrare il payload con AES-GCM
  const payloadBytes = new TextEncoder().encode(payload)
  
  // Invia la richiesta
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'TTL': '86400',
      'Authorization': vapidHeader,
    },
    body: payloadBytes,
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Push notification failed: ${response.status} ${response.statusText} - ${errorText}`)
  }
}

