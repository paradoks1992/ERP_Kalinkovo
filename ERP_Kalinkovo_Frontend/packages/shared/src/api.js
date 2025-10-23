export async function fetchData(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Ошибка запроса: ${res.status}`)
  return res.json()
}
