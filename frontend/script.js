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

const modal    = document.getElementById('modal');
const btnFechar = document.getElementById('btn-fechar');
 
// Seleciona TODOS os botões de abrir modal pela classe
document.querySelectorAll('.btn-abrir-modal').forEach(btn => {
  btn.addEventListener('click', () => modal.classList.add('ativo'));
});
 
// Botão X fecha
btnFechar.addEventListener('click', () => modal.classList.remove('ativo'));
 
// Clicou fora da caixinha → fecha
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.remove('ativo');
});