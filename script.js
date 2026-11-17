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
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else {
        const input = document.createElement('textarea'); input.value=email; input.style.position='fixed';input.style.opacity='0';document.body.append(input);input.select();
        if (!document.execCommand('copy')) throw new Error('Copy unavailable');
        input.remove();
      }
      const original=button.textContent;button.textContent='Copied ✓';
      setTimeout(() => {button.textContent=original;},1800);
    } catch (err) {window.location.href='mailto:'+email;}
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
  const fades=document.querySelectorAll('.fade');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries => entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});
    fades.forEach(e=>observer.observe(e));
  } else fades.forEach(e=>e.classList.add('visible'));
  const year=document.querySelector('[data-current-year]');if(year)year.textContent=new Date().getFullYear();
})();
