const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const filterButtons = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.deal-card');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');

    cards.forEach((card) => {
      const categories = card.dataset.category || '';
      const shouldShow = filter === 'all' || categories.includes(filter);
      card.style.display = shouldShow ? 'grid' : 'none';
    });
  });
});


const couponButtons = document.querySelectorAll('.coupon-code');
couponButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const originalText = button.textContent;
    const copyText = button.dataset.copy || originalText;
    if (/no public code|required|check current|use current/i.test(copyText)) {
      button.textContent = 'Check official deal';
      setTimeout(() => { button.textContent = originalText; }, 1400);
      return;
    }
    try {
      await navigator.clipboard.writeText(copyText);
      button.textContent = 'Copied!';
      setTimeout(() => { button.textContent = originalText; }, 1400);
    } catch (error) {
      button.textContent = 'Copy manually';
      setTimeout(() => { button.textContent = originalText; }, 1400);
    }
  });
});


// Affiliate click tracking helper. Add your GA4 tag to the site, and this will send click events.
document.querySelectorAll('a[rel~="sponsored"], .affiliate-link').forEach((link) => {
  link.addEventListener('click', () => {
    const provider = link.dataset.provider || link.textContent.trim().replace(/\s+/g, ' ').slice(0, 80);
    const placement = link.dataset.placement || document.title;
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        provider,
        placement,
        link_url: link.href
      });
    }
    try {
      const key = 'shellz_affiliate_clicks';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      existing.push({ provider, placement, url: link.href, time: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(existing.slice(-50)));
    } catch (error) {
      // Local storage is optional. Ignore if unavailable.
    }
  });
});


// Coupon reveal popups
(function () {
  const showButtons = document.querySelectorAll('.show-code-btn');
  if (!showButtons.length) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'coupon-modal-backdrop';
  backdrop.innerHTML = `
    <div class="coupon-modal" role="dialog" aria-modal="true" aria-labelledby="coupon-modal-title">
      <div class="coupon-modal-head">
        <p id="coupon-modal-provider">Shellz coupon</p>
        <h2 id="coupon-modal-title">Coupon code</h2>
        <button class="coupon-modal-close" type="button" aria-label="Close coupon popup">×</button>
      </div>
      <div class="coupon-modal-body">
        <p class="coupon-modal-note" id="coupon-modal-note">Copy the code, then open the provider in a new tab and apply it at checkout.</p>
        <div class="revealed-code-box">
          <div class="revealed-code" id="revealed-code">CODE</div>
          <button class="copy-modal-code" type="button">Copy</button>
        </div>
        <div class="coupon-modal-actions">
          <a class="btn primary" id="coupon-visit-link" href="#" target="_blank" rel="sponsored nofollow noopener noreferrer">Visit site</a>
          <a class="btn secondary" id="coupon-review-link" href="#">Read review</a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  const providerEl = backdrop.querySelector('#coupon-modal-provider');
  const titleEl = backdrop.querySelector('#coupon-modal-title');
  const noteEl = backdrop.querySelector('#coupon-modal-note');
  const codeEl = backdrop.querySelector('#revealed-code');
  const visitLink = backdrop.querySelector('#coupon-visit-link');
  const reviewLink = backdrop.querySelector('#coupon-review-link');
  const closeBtn = backdrop.querySelector('.coupon-modal-close');
  const copyBtn = backdrop.querySelector('.copy-modal-code');

  let activeCode = '';

  function openModal(button) {
    const provider = button.dataset.provider || 'Provider';
    const title = button.dataset.title || 'Coupon code';
    const code = button.dataset.code || '';
    const url = button.dataset.url || '#';
    const review = button.dataset.review || 'reviews.html';
    const realCode = button.dataset.realCode === 'true';

    activeCode = code;

    providerEl.textContent = provider;
    titleEl.textContent = title;
    codeEl.textContent = code;
    visitLink.href = url;
    reviewLink.href = review;

    if (realCode) {
      noteEl.textContent = 'Copy this code, open the provider in a new tab, and apply it at checkout. Verify the final total before buying.';
      copyBtn.style.display = '';
      copyBtn.textContent = 'Copy';
    } else {
      noteEl.textContent = 'This offer may not require a public code. Open the provider page and verify the live deal at checkout.';
      copyBtn.style.display = 'none';
    }

    backdrop.classList.add('active');
    closeBtn.focus();
  }

  function closeModal() {
    backdrop.classList.remove('active');
  }

  showButtons.forEach((button) => {
    button.addEventListener('click', () => openModal(button));
  });

  copyBtn.addEventListener('click', async () => {
    if (!activeCode) return;
    try {
      await navigator.clipboard.writeText(activeCode);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    } catch (error) {
      copyBtn.textContent = 'Copy manually';
      setTimeout(() => { copyBtn.textContent = 'Copy'; }, 1500);
    }
  });

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });
});
})();
