// CONFIGURAÇÃO CAROUSEL DEPOIMENTOS

(function () {
  const track    = document.getElementById('track');
  const btnPrev  = document.getElementById('btn-prev');
  const btnNext  = document.getElementById('btn-next');
  const dotsWrap = document.getElementById('dots');

  if (!track || !btnPrev || !btnNext || !dotsWrap) return;

  const GAP = 20;
  function getVisible() {
    const cssVal = parseInt(
      getComputedStyle(track.parentElement).getPropertyValue('--visible')
    );
    return isNaN(cssVal) ? 3 : cssVal;
  }

  const originalCards = Array.from(track.children);
  const totalOriginal  = originalCards.length;

  function buildClones() {
    const visible = getVisible();

    track.innerHTML = '';
    originalCards.forEach(c => track.appendChild(c));

    originalCards.slice(0, visible).forEach(c => {
      track.appendChild(c.cloneNode(true));
    });

    originalCards.slice(-visible).forEach(c => {
      track.insertBefore(c.cloneNode(true), track.firstChild);
    });
  }

  let currentIndex = 0;
  let isJumping    = false;

  function getCardWidth() {
    const trackWidth = track.parentElement.offsetWidth;
    return (trackWidth + GAP) / getVisible();
  }

  function moveTo(realIndex, animate) {
    const visible  = getVisible();
    const domIndex = realIndex + visible;
    const offset   = domIndex * getCardWidth();

    track.style.transition = animate
      ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none';
    track.style.transform  = `translateX(-${offset}px)`;
  }

  function navigate(direction) {
    if (isJumping) return;

    currentIndex += direction;
    moveTo(currentIndex, true);
    updateDots();

    if (currentIndex >= totalOriginal || currentIndex < 0) {
      isJumping = true;

      track.addEventListener('transitionend', function onEnd() {
        track.removeEventListener('transitionend', onEnd);

        if (currentIndex >= totalOriginal) currentIndex = 0;
        if (currentIndex < 0)             currentIndex = totalOriginal - 1;

        moveTo(currentIndex, false);
        updateDots();

        requestAnimationFrame(() => {
          requestAnimationFrame(() => { isJumping = false; });
        });
      }, { once: true });
    }
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < totalOriginal; i++) {
      const d = document.createElement('button');
      d.className = 'dot';
      d.setAttribute('aria-label', `Card ${i + 1}`);
      d.addEventListener('click', () => {
        if (isJumping) return;
        currentIndex = i;
        moveTo(currentIndex, true);
        updateDots();
      });
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    const idx = ((currentIndex % totalOriginal) + totalOriginal) % totalOriginal;
    dotsWrap.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  function init() {
    buildClones();
    buildDots();
    moveTo(currentIndex, false);
    updateDots();
    btnPrev.disabled = false;
    btnNext.disabled = false;
  }

  btnNext.addEventListener('click', () => navigate(+1));
  btnPrev.addEventListener('click', () => navigate(-1));

  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
  }, { passive: true });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildClones();
      moveTo(currentIndex, false);
    }, 150);
  });

  init();
})();


// CONFIGURAÇÃO MODAL
const form = document.getElementById('form-orcamento');
const modal = document.getElementById('modal');
const btnFechar = document.getElementById('btn-fechar');

const fecharELimparModal = () => {
    modal.classList.remove('ativo');
    if (form) form.reset();
};

document.querySelectorAll('.btn-abrir-modal').forEach(btn => {
    btn.addEventListener('click', () => modal.classList.add('ativo'));
});
btnFechar.addEventListener('click', fecharELimparModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharELimparModal();
});

// CONFIGURAÇÃO FORMULÁRIO MODAL 
document.addEventListener('submit', (e) => {
    if (e.target.id === 'form-orcamento') {
        e.preventDefault();

        const id = "4410848015600"; 
        
        const n = id.split('').map(d => parseInt(d) + 1).join('');
        
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const evento = document.getElementById('evento').value;
        const mensagem = document.getElementById('mensagem').value;

        const texto = `*Novo Orçamento*%0A%0A*Nome:* ${nome}%0A*E-mail:* ${email}%0A*Evento:* ${evento}%0A*Mensagem:* ${mensagem}`;

        window.open(`https://api.whatsapp.com/send?phone=${n}&text=${texto}`, '_blank');

        fecharELimparModal();
    }
});