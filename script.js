(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('primary-navigation');
  if (menuButton && menu) {
    const closeMenu = () => { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.textContent = '☰'; };
    menuButton.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.textContent = isOpen ? '×' : '☰';
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  }
  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const email = 'ioannou.kosti@gmail.com';
    const status = button.closest('.contact-methods')?.querySelector('[data-copy-status]');
    const setStatus = message => { if (status) status.textContent = message; };
    const copyWithSelection = () => {
      const input = document.createElement('textarea');
      input.value = email;
      input.setAttribute('readonly', '');
      input.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.append(input);
      try {
        input.select();
        if (!document.execCommand('copy')) throw new Error('Copy unavailable');
      } finally {
        input.remove();
        button.focus();
      }
    };
    try {
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(email); }
        catch { copyWithSelection(); }
      } else copyWithSelection();
      setStatus('Email address copied.');
    } catch {
      setStatus('Please select and copy the email address shown above.');
    }
  }));
  const blocks = [
    ['Host / RoCC','Rocket software configures and starts LUMIXED through custom RoCC commands. The accelerator is attached to the RISC-V system.'],
    ['DMA & buffers','A TileLink-based DMA transfers data between system memory and local storage. Weight buffering supports prefetch and reuse.'],
    ['Product generation','Input activations are used to generate a compact set of reusable even-valued products in LUT-style memories.'],
    ['Select & accumulate','Weight-controlled selection, odd-product correction, sign handling, and accumulation produce matrix outputs.']
  ];
  const buttons=[...document.querySelectorAll('[data-arch-step]')];
  const title=document.getElementById('arch-title');
  const detail=document.getElementById('arch-description');
  if (buttons.length && title && detail) {
    buttons.forEach((button,index) => button.addEventListener('click',() => {
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      title.textContent=blocks[index][0];detail.textContent=blocks[index][1];
    }));
  }
  const footprintChart = document.getElementById('footprint-chart');
  const footprintTable = document.querySelector('.footprint-table');
  if (footprintChart && footprintTable) {
    const metrics = {
      luts: { column: 1, label: 'LUTs', unit: '' },
      registers: { column: 2, label: 'Registers', unit: '' },
      bram: { column: 3, label: 'BRAM tiles', unit: '' },
      dsps: { column: 4, label: 'DSPs', unit: '' },
      power: { column: 5, label: 'Estimated dynamic power', unit: 'mW' }
    };
    const selector = footprintChart.querySelector('select');
    const bars = footprintChart.querySelector('[data-footprint-bars]');
    const caption = footprintChart.querySelector('[data-footprint-title]');
    const axisMax = footprintChart.querySelector('[data-footprint-max]');
    const note = footprintChart.querySelector('[data-footprint-note]');
    const status = footprintChart.querySelector('[role="status"]');
    const number = new Intl.NumberFormat('en-US');
    // The exact-values table is the single source for all plotted values.
    const designs = Array.from(footprintTable.tBodies[0].rows, row => ({
      name: row.cells[0].firstChild.textContent.trim(),
      highlight: row.classList.contains('footprint-highlight'),
      values: Object.fromEntries(Object.entries(metrics).map(([key, metric]) => [
        key, Number(row.cells[metric.column].textContent.replace(/[^\d.]/g, ''))
      ]))
    }));
    const valid = designs.length > 0 && designs.every(design =>
      Object.values(design.values).every(value => Number.isFinite(value) && value >= 0));
    if (valid) {
      const rows = designs.map(design => {
        const row = document.createElement('div');
        row.className = 'footprint-bar-row';
        if (design.highlight) row.classList.add('is-lumixed');
        const label = document.createElement('span');
        label.className = 'footprint-bar-label';
        label.textContent = design.name;
        const track = document.createElement('div');
        track.className = 'footprint-bar-track';
        const fill = document.createElement('div');
        fill.className = 'footprint-bar-fill';
        track.append(fill);
        const value = document.createElement('span');
        value.className = 'footprint-bar-value';
        row.append(label, track, value);
        bars.append(row);
        return { fill, value };
      });
      const renderFootprint = (announce = false) => {
        const key = selector.value;
        const metric = metrics[key];
        if (!metric) return;
        const maximum = Math.max(...designs.map(design => design.values[key]));
        const magnitude = 10 ** Math.floor(Math.log10(maximum || 1));
        const ceiling = [1, 2, 2.5, 5, 10].map(step => step * magnitude)
          .find(step => step >= maximum);
        const format = value => number.format(value) + (metric.unit ? ' ' + metric.unit : '');
        designs.forEach((design, index) => {
          rows[index].fill.style.width = (100 * design.values[key] / ceiling) + '%';
          rows[index].value.textContent = format(design.values[key]);
        });
        const summary = metric.label + ': ' + designs.map(design =>
          design.name + ' ' + format(design.values[key])).join('; ') + '.';
        bars.setAttribute('aria-label', summary);
        caption.textContent = metric.label;
        axisMax.textContent = format(ceiling);
        note.textContent = key === 'power'
          ? 'Accelerator dynamic power: Vivado vectorless estimates at 50 MHz, not measured board power.'
          : 'Post-route accelerator resources for the same three implementations.';
        if (announce) status.textContent = summary;
      };
      renderFootprint();
      selector.addEventListener('change', () => renderFootprint(true));
      footprintChart.hidden = false;
    }
  }
  const fades=document.querySelectorAll('.fade');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
    fades.forEach(e=>observer.observe(e));
  } else fades.forEach(e=>e.classList.add('visible'));
  const year=document.querySelector('[data-current-year]');if(year)year.textContent=new Date().getFullYear();
})();
