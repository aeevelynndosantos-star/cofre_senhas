/* criptografia (Web Crypto API nativa do navegador) */

const KDF_ITERATIONS = 300000;

function novoSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

async function derivarChave(senha, salt) {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(senha), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: KDF_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// cifra qualquer objeto JSON;
async function cifrarObjeto(key, objeto) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const claro = new TextEncoder().encode(JSON.stringify(objeto));
  const cifrado = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, claro);
  return { iv: toB64(iv), dados: toB64(cifrado) };
}

async function decifrarObjeto(key, ivB64, dadosB64) {
  const claro = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(ivB64) }, key, fromB64(dadosB64));
  return JSON.parse(new TextDecoder().decode(claro));
}
