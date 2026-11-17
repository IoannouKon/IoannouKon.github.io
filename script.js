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
  const footprintTable = document.querySelector('#hardware-comparison .footprint-table');
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
  const cycleChart = document.getElementById('llms-cycle-chart');
  const cycleData = document.getElementById('llms-cycle-data');
  if (cycleChart && cycleData) {
    const archive = JSON.parse(cycleData.textContent);
    const batch = document.getElementById('llms-batch');
    const workload = document.getElementById('llms-workload');
    const counter = document.getElementById('llms-counter');
    const table = document.getElementById('llms-results-table');
    const bars = cycleChart.querySelector('[data-cycle-bars]');
    const title = cycleChart.querySelector('[data-cycle-title]');
    const axisMax = cycleChart.querySelector('[data-cycle-max]');
    const note = cycleChart.querySelector('[data-cycle-note]');
    const status = cycleChart.querySelector('[role="status"]');
    const scope = document.getElementById('llms-scope');
    const number = new Intl.NumberFormat('en-US');
    const barRows = new Map();
    const renderCycles = (announce = false) => {
      const dataset = archive.datasets.find(item => item.id === batch.value);
      if (!dataset) return;
      const all = workload.value === 'all';
      const selectedCase = dataset.designs[0].cases.find(item => item.id === workload.value);
      const workloadLabel = all ? 'All 12 kernels' :
        selectedCase.r + ' × ' + selectedCase.k + ' × ' + selectedCase.n + ' · ' + selectedCase.id;
      const results = dataset.designs.map(design => {
        const cases = design.cases.filter(item => all || item.id === workload.value);
        return { ...design,
          active: cases.reduce((sum, item) => sum + item.active, 0),
          whole: cases.reduce((sum, item) => sum + item.whole, 0)
        };
      });
      const metric = counter.value;
      const maximum = Math.max(...results.map(result => result[metric]));
      const magnitude = 10 ** Math.floor(Math.log10(maximum || 1));
      const ceiling = [1, 2, 2.5, 5, 10].map(step => step * magnitude)
        .find(step => step >= maximum);
      const activeKeys = new Set();
      const tableRows = [];
      results.forEach(result => {
        const key = result.brand + ' ' + result.config;
        activeKeys.add(key);
        let elements = barRows.get(key);
        if (!elements) {
          const row = document.createElement('div');
          row.className = 'footprint-bar-row';
          if (result.kind === 'lumixed') row.classList.add('is-lumixed');
          const label = document.createElement('span');
          label.className = 'footprint-bar-label';
          label.append(document.createTextNode(result.brand));
          const config = document.createElement('small');
          config.textContent = result.config;
          label.append(config);
          const track = document.createElement('div');
          track.className = 'footprint-bar-track';
          const fill = document.createElement('div');
          fill.className = 'footprint-bar-fill';
          track.append(fill);
          const value = document.createElement('span');
          value.className = 'footprint-bar-value';
          row.append(label, track, value);
          elements = { row, fill, value };
          barRows.set(key, elements);
        }
        bars.append(elements.row);
        elements.fill.style.width = (100 * result[metric] / ceiling) + '%';
        elements.value.textContent = number.format(result[metric]);
        const row = document.createElement('tr');
        if (result.kind === 'lumixed') row.className = 'footprint-highlight';
        const label = document.createElement('th');
        label.scope = 'row';
        const link = document.createElement('a');
        link.href = archive.sourceRepository + '/blob/main/' + result.source;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = result.brand;
        const config = document.createElement('span');
        config.textContent = result.config;
        label.append(link, config);
        row.append(label);
        for (const field of ['active', 'whole']) {
          const value = document.createElement('td');
          value.textContent = number.format(result[field]);
          row.append(value);
        }
        tableRows.push(row);
      });
      for (const [key, elements] of barRows) {
        if (!activeKeys.has(key)) { elements.row.remove(); barRows.delete(key); }
      }
      table.tBodies[0].replaceChildren(...tableRows);
      table.caption.textContent = dataset.label + ' · ' + workloadLabel;
      title.textContent = metric === 'active' ? 'Active accelerator cycles' : 'Whole-call core cycles';
      axisMax.textContent = number.format(ceiling) + ' cycles';
      scope.textContent = dataset.scope + (all
        ? ' Totals cover all 12 kernels and exclude smoke checks.'
        : ' Selected matrix: ' + workloadLabel + ' (R × K × N).');
      note.textContent = metric === 'active'
        ? 'Accelerator-active cycles; overlapping diagnostic counters are not added together. Lower is fewer cycles.'
        : 'Whole-call core cycles include the surrounding software call. Lower is fewer cycles.';
      const summary = results.map(result => result.brand + ' ' + result.config + ': ' +
        number.format(result[metric]) + ' cycles').join('; ');
      bars.setAttribute('aria-label', title.textContent + '. ' + summary);
      if (announce) status.textContent = dataset.label + '. ' + workloadLabel + '. ' + summary;
    };
    renderCycles();
    for (const control of [batch, workload, counter]) {
      control.addEventListener('change', () => renderCycles(true));
    }
    cycleChart.hidden = false;
  }
  const fades=document.querySelectorAll('.fade');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
    fades.forEach(e=>observer.observe(e));
  } else fades.forEach(e=>e.classList.add('visible'));
  const year=document.querySelector('[data-current-year]');if(year)year.textContent=new Date().getFullYear();
})();
