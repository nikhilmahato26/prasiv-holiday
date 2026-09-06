const clients = ["Radisson Hotels", "Hyatt Hotels"];
async function seed() {
  for (const name of clients) {
    const res = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f3f4f6&color=111` })
    });
    console.log(res.status, await res.text());
  }
}
seed();
