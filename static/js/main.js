const form = document.querySelector('#recognition-form');
const input = document.querySelector('#image-input');
const zone = document.querySelector('#dropzone');
const preview = document.querySelector('#preview');
const prompt = document.querySelector('#upload-prompt');
const clear = document.querySelector('#clear');
const submit = document.querySelector('#submit');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const change = document.querySelector('#change-photo');
let selected = null, previewUrl = null, busy = false;
function message(text, error = false) { status.textContent = text; status.classList.toggle('error', error); }
function select(file) {
  if (busy) return;
  result.hidden = true; message('');
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { message('Choose a JPG, PNG, or WebP image.', true); return; }
  if (file.size > 10 * 1024 * 1024) { message('Please choose an image smaller than 10 MB.', true); return; }
  selected = file;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file); preview.src = previewUrl;
  preview.hidden = false; prompt.hidden = true; clear.hidden = false; change.hidden = false;
  document.querySelector('#file-name').textContent = file.name;
  submit.disabled = false;
}
input.addEventListener('change', () => select(input.files[0]));
clear.addEventListener('click', () => {
  if (busy) return;
  selected = null; input.value = ''; preview.hidden = true; preview.removeAttribute('src');
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = null; prompt.hidden = false; clear.hidden = true; change.hidden = true;
  result.hidden = true; submit.disabled = true; message('');
  document.querySelector('#file-name').textContent = 'No photo selected';
});
['dragenter', 'dragover'].forEach(event => zone.addEventListener(event, e => { e.preventDefault(); zone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach(event => zone.addEventListener(event, e => { e.preventDefault(); zone.classList.remove('dragging'); }));
zone.addEventListener('drop', e => select(e.dataTransfer.files[0]));
form.addEventListener('submit', async e => {
  e.preventDefault(); if (!selected || busy) return;
  busy = true; submit.disabled = true; input.disabled = true; clear.disabled = true;
  form.setAttribute('aria-busy', 'true'); zone.classList.add('busy'); result.hidden = true;
  document.querySelector('#button-text').textContent = 'Finding the match…';
  message('Looking for a face and comparing it with the collection…');
  const data = new FormData(); data.append('image', selected);
  try {
    const response = await fetch(form.action, { method: 'POST', body: data });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Something went wrong. Please try again.');
    document.querySelector('#result-name').textContent = payload.name;
    result.hidden = false; message('');
  } catch (error) { message(error.message || 'Unable to connect. Please try again.', true); }
  finally {
    busy = false; submit.disabled = false; input.disabled = false; clear.disabled = false;
    form.removeAttribute('aria-busy'); zone.classList.remove('busy');
    document.querySelector('#button-text').textContent = 'Find the match';
  }
});
