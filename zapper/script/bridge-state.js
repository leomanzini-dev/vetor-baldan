// Estado compartilhado da sessão WhatsApp

let state = {
  status: "disconnected", // disconnected | qr_ready | connected
  qr: null,               // data URL base64 do QR
  jid: null,               // JID do número conectado
};

export function getSessionState() {
  return { ...state };
}

export function updateSessionState(partial) {
  state = { ...state, ...partial };
}
