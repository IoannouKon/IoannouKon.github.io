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
  const explorer = document.querySelector('[data-mode-explorer]');
  if (explorer) {
    const nav = explorer.querySelector('.mode-nav');
    const links = [...nav.querySelectorAll('a')];
    const panels = [...explorer.querySelectorAll('.mode-panel')];

    const showMode = (hash, focus = false) => {
      const active = panels.find(panel => '#' + panel.id === hash) || panels[0];
      panels.forEach(panel => { panel.hidden = panel !== active; });
      links.forEach(link => {
        if (link.hash === '#' + active.id) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      if (focus) active.querySelector('h3').focus();
    };

    showMode(window.location.hash);
    nav.hidden = false;
    explorer.querySelectorAll('.mode-panel-nav').forEach(controls => { controls.hidden = false; });
    explorer.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#datapath-"]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.history.pushState(null, '', link.hash);
      showMode(link.hash, true);
      explorer.scrollIntoView({ block: 'start' });
    });
    window.addEventListener('hashchange', () => showMode(window.location.hash));
  }

  const figureViewer = document.getElementById('figure-viewer');
  if (figureViewer && typeof figureViewer.showModal === 'function') {
    const figures = [...document.querySelectorAll('.schematics [data-figure-open]')];
    const image = figureViewer.querySelector('img');
    const title = figureViewer.querySelector('#figure-title');
    const count = figureViewer.querySelector('[data-figure-count]');
    const original = figureViewer.querySelector('[data-figure-original]');
    let current = 0;
    let opener;

    const showFigure = index => {
      current = (index + figures.length) % figures.length;
      const figure = figures[current];
      title.textContent = figure.querySelector('.schematic-caption').firstChild.textContent.trim();
      image.alt = figure.querySelector('img').alt;
      image.src = figure.href;
      original.href = figure.href;
      count.textContent = (current + 1) + ' / ' + figures.length;
    };

    document.querySelectorAll('[data-figure-open]').forEach(link => {
      link.addEventListener('click', event => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const index = figures.findIndex(figure => figure.href === link.href);
        if (index === -1) return;
        event.preventDefault();
        opener = link;
        showFigure(index);
        figureViewer.showModal();
      });
    });
    figureViewer.querySelector('[data-figure-prev]').addEventListener('click', () => showFigure(current - 1));
    figureViewer.querySelector('[data-figure-next]').addEventListener('click', () => showFigure(current + 1));
    figureViewer.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      showFigure(current + (event.key === 'ArrowLeft' ? -1 : 1));
    });
    figureViewer.addEventListener('click', event => {
      if (event.target === figureViewer) figureViewer.close();
    });
    figureViewer.addEventListener('close', () => opener?.focus());
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
    const sharedGemmini = archive.datasets.find(item => item.id === 'optimized-w2')
      ?.designs.find(design => design.kind === 'gemmini' && design.config.startsWith('8×8'));
    const precision = document.getElementById('llms-precision');
    const batches = {
      W8: { id: 'earlier-w8', label: 'ID8 batch' },
      W4: { id: 'earlier-w4', label: 'ID8 batch' },
      W2: { id: 'optimized-w2', label: 'Optimized ID16 batch' }
    };
    const bars = cycleChart.querySelector('[data-cycle-bars]');
    const title = cycleChart.querySelector('[data-cycle-title]');
    const axisMax = cycleChart.querySelector('[data-cycle-max]');
    const note = cycleChart.querySelector('[data-cycle-note]');
    const status = cycleChart.querySelector('[role="status"]');
    const number = new Intl.NumberFormat('en-US');
    const barRows = new Map();
    const renderCycles = (announce = false) => {
      const batch = batches[precision.value];
      const dataset = archive.datasets.find(item => item.id === batch.id);
      if (!dataset) return;
      const designs = [...dataset.designs];
      if (sharedGemmini && !designs.includes(sharedGemmini)) designs.push(sharedGemmini);
      const results = designs.map(design => ({
        ...design,
        sharedReference: design === sharedGemmini,
        whole: design.cases.reduce((sum, item) => sum + item.whole, 0)
      }));
      const maximum = Math.max(...results.map(result => result.whole));
      const magnitude = 10 ** Math.floor(Math.log10(maximum || 1));
      const ceiling = [1, 2, 2.5, 5, 10].map(step => step * magnitude)
        .find(step => step >= maximum);
      const activeKeys = new Set();
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
          config.textContent = result.config + (result.sharedReference ? ' · Shared reference' : '');
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
        elements.fill.style.width = (100 * result.whole / ceiling) + '%';
        elements.value.textContent = number.format(result.whole);
      });
      for (const [key, elements] of barRows) {
        if (!activeKeys.has(key)) { elements.row.remove(); barRows.delete(key); }
      }
      title.textContent = 'Whole-call core cycles';
      axisMax.textContent = number.format(ceiling) + ' cycles';
      note.textContent = 'FP16 activations · ' + batch.label + ' · Total across 12 workloads';
      const summary = results.map(result => result.brand + ' ' + result.config +
        (result.sharedReference ? ' (shared reference)' : '') + ': ' +
        number.format(result.whole) + ' cycles').join('; ');
      bars.setAttribute('aria-label', title.textContent + '. ' + summary);
      if (announce) status.textContent = precision.value + '. ' + note.textContent + '. ' + summary;
    };
    renderCycles();
    precision.addEventListener('change', () => renderCycles(true));
    cycleChart.hidden = false;
  }
  const fades=document.querySelectorAll('.fade');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
    fades.forEach(e=>observer.observe(e));
  } else fades.forEach(e=>e.classList.add('visible'));
  const year=document.querySelector('[data-current-year]');if(year)year.textContent=new Date().getFullYear();
})();
