const client = supabase.createClient('https://rkykifprxauikmucqwaa.supabase.co', 'sb_publishable_3KfAGVBSTjO67XaXdvPuBQ_7doPuHST');

async function sendrudhra() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhra' }]);
  error ? console.error(error.message) : readMessages();
}

async function readMessages() {
  const { data, error } = await client.from('messages').select('*').order('id', { ascending: false });
  if (error) return console.error(error.message);

  document.getElementById('list').innerHTML = data.map(m => 
    `<li>${m.content} <button onclick="deleteMessage(${m.id})">Delete</button></li>`
  ).join('');
}

async function deleteMessage(id) {
  const { error } = await client.from('messages').delete().eq('id', id);
  error ? console.error(error.message) : readMessages();
}

