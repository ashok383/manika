const client = supabase.createClient('https://rkykifprxauikmucqwaa.supabase.co', 'sb_publishable_3KfAGVBSTjO67XaXdvPuBQ_7doPuHST');
//================================================================================================================================
async function sendrudhra() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}
//================================================================================
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

//================================================================================================================================
async function send_01() {
  const { error } = await client.from('messages').insert([{ content: 'resume' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_02() {
  const { error } = await client.from('messages').insert([{ content: 'photo_studio' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_03() {
  const { error } = await client.from('messages').insert([{ content: 'image_crop' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_04() {
  const { error } = await client.from('messages').insert([{ content: 'photo_resize' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_05() {
  const { error } = await client.from('messages').insert([{ content: 'pdf_to_jpeg' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_06() {
  const { error } = await client.from('messages').insert([{ content: 'images_to_pdf' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_07() {
  const { error } = await client.from('messages').insert([{ content: 'print_portal' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_08() {
  const { error } = await client.from('messages').insert([{ content: 'sarkari_result' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_09() {
  const { error } = await client.from('messages').insert([{ content: 'user_log' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_10() {
  const { error } = await client.from('messages').insert([{ content: 'photo_signature' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_11() {
  const { error } = await client.from('messages').insert([{ content: 'pdf_unlocker' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_12() {
  const { error } = await client.from('messages').insert([{ content: 'pdf_validator' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_13() {
  const { error } = await client.from('messages').insert([{ content: 'pdf_compressor' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_14() {
  const { error } = await client.from('messages').insert([{ content: 'pdf_to_word' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_15() {
  const { error } = await client.from('messages').insert([{ content: 'word_to_pdf' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_16() {
  const { error } = await client.from('messages').insert([{ content: 'pdf_to_excel' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_17() {
  const { error } = await client.from('messages').insert([{ content: 'exce_to_pdf' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_18() {
  const { error } = await client.from('messages').insert([{ content: 'jpg|jpeg_png' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_19() {
  const { error } = await client.from('messages').insert([{ content: 'png_jpg|jpeg' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_20() {
  const { error } = await client.from('messages').insert([{ content: 'text_to_pdf' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_21() {
  const { error } = await client.from('messages').insert([{ content: 'pdf_editor' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_22() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_23() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_24() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_25() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_26() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_27() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_28() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_29() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}

async function send_30() {
  const { error } = await client.from('messages').insert([{ content: 'hellowrudhraimagespdf9' }]);
  error ? console.error(error.message) : readMessages();
}
