(() => {
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  function closeMenu() { if (!menu || !nav) return; nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.textContent='☰'; }
  menu?.addEventListener('click', () => { const opened = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(opened)); menu.textContent = opened ? '✕' : '☰'; });
  document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click',closeMenu));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const year = document.getElementById('year'); if (year) year.textContent = String(new Date().getFullYear());
  const blocks = {
    rocket: ['01 / CONTROL','Rocket CPU','Host software issues custom RoCC commands to configure and launch the accelerator. The compute-intensive work runs in the connected LUMIXED unit.'],
    controller: ['02 / CONTROL','LUMIXED controller','The RoCC-connected controller manages execution states, parameters, accelerator scheduling, and DMA requests.'],
    memory: ['03 / STORAGE','System memory','Activation tensors, packed quantized weights, and output buffers live in the SoC memory space and are accessed through DMA.'],
    dma: ['04 / TRANSFER','TileLink DMA engine','LUMIXED issues TileLink memory requests to move activation and weight data into local buffers and write final results to memory.'],
    products: ['05 / COMPUTE','Product generation and lookup memories','Activation products are generated once for a window and stored in lookup memories for reuse across multiple weight columns.'],
    selection: ['06 / COMPUTE','Selection and correction','Packed low-bit weights select precomputed products. Sign and odd-weight correction reconstruct each product; double-buffered weights overlap fetch with compute.'],
    accumulate: ['07 / COMPUTE','Accumulation and writeback','The adder tree combines selected products; partial sums are retained across windows and output values are written back through DMA.']
  };
  document.querySelectorAll('[data-part]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-part]').forEach(b => { b.classList.remove('selected'); b.setAttribute('aria-pressed','false'); });
    button.classList.add('selected'); button.setAttribute('aria-pressed','true');
    const item = blocks[button.dataset.part]; if (!item) return;
    document.getElementById('part-tag').textContent = item[0];
    document.getElementById('part-title').textContent = item[1];
    document.getElementById('part-copy').textContent = item[2];
  }));
  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText('ioannou.kosti@gmail.com'); button.textContent = 'Copied email ✓'; }
    catch { window.location.href='mailto:ioannou.kosti@gmail.com'; }
  }));
})();
