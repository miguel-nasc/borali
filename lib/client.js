// Helper usado pelos componentes de cliente para chamar a API.
export async function sendJson(endpoint, method, data) {
  try {
    const res = await fetch(endpoint, {
      method,
      headers: data === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && json.ok !== false, json };
  } catch {
    return { ok: false, json: { error: 'Sem conexão. Verifique sua internet e tente de novo.' } };
  }
}
