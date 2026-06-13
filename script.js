// Shellz.com site interactions
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    // Footer year
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // Deal-card filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.deal-card');

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter || 'all';

        filterButtons.forEach((btn) => btn.classList.remove('active'));
        button.classList.add('active');

        cards.forEach((card) => {
          const categories = card.dataset.category || '';
          const shouldShow = filter === 'all' || categories.includes(filter);
          card.style.display = shouldShow ? 'grid' : 'none';
        });
      });
    });

    // Legacy coupon copy buttons
    document.querySelectorAll('.coupon-code').forEach((button) => {
      button.addEventListener('click', async () => {
        const originalText = button.textContent;
        const copyText = button.dataset.copy || originalText;

        if (/no public code|required|check current|use current|get deal/i.test(copyText)) {
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

    function trackAffiliateClick(provider, placement, url) {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'affiliate_click', {
          provider: provider,
          placement: placement,
          link_url: url
        });
      }

      try {
        const key = 'shellz_affiliate_clicks';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({ provider, placement, url, time: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(existing.slice(-100)));
      } catch (error) {
        // Local storage is optional. Ignore if unavailable.
      }
    }

    // Affiliate click tracking
    document.querySelectorAll('a[rel~="sponsored"], .affiliate-link').forEach((link) => {
      link.addEventListener('click', () => {
        const provider = link.dataset.provider || link.textContent.trim().replace(/\s+/g, ' ').slice(0, 80);
        const placement = link.dataset.placement || document.title;
        trackAffiliateClick(provider, placement, link.href);
      });
    });

    // Coupon reveal modal
    let backdrop = null;
    let activeCode = '';

    function ensureCouponModal() {
      if (backdrop) return backdrop;

      backdrop = document.createElement('div');
      backdrop.className = 'coupon-modal-backdrop';
      backdrop.innerHTML = `
        <div class="coupon-modal" role="dialog" aria-modal="true" aria-labelledby="coupon-modal-title">
          <div class="coupon-modal-head">
            <p id="coupon-modal-provider">Shellz coupon</p>
            <h2 id="coupon-modal-title">Coupon code</h2>
            <button class="coupon-modal-close" type="button" aria-label="Close coupon popup">×</button>
          </div>
          <div class="coupon-modal-body">
            <p class="coupon-modal-note" id="coupon-modal-note">Copy the code, then open the provider and apply it at checkout.</p>
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

      const closeBtn = backdrop.querySelector('.coupon-modal-close');
      const copyBtn = backdrop.querySelector('.copy-modal-code');

      function closeModal() {
        backdrop.classList.remove('active');
        document.body.classList.remove('coupon-modal-open');
      }

      closeBtn.addEventListener('click', closeModal);

      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) closeModal();
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

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && backdrop.classList.contains('active')) {
          closeModal();
        }
      });

      return backdrop;
    }

    function openCouponModal(button) {
      const modal = ensureCouponModal();

      const provider = button.dataset.provider || 'Provider';
      const title = button.dataset.title || 'Coupon code';
      const code = button.dataset.code || '';
      const url = button.dataset.url || button.getAttribute('href') || '#';
      const review = button.dataset.review || 'reviews.html';
      const realCode = String(button.dataset.realCode || '').toLowerCase() === 'true';

      // For "Get Deal" cards, open the provider directly.
      if (!realCode) {
        trackAffiliateClick(provider, title || document.title, url);
        if (url && url !== '#') {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
        return;
      }

      activeCode = code;

      modal.querySelector('#coupon-modal-provider').textContent = provider;
      modal.querySelector('#coupon-modal-title').textContent = title;
      modal.querySelector('#revealed-code').textContent = code || 'Check deal';
      modal.querySelector('#coupon-visit-link').href = url || '#';
      modal.querySelector('#coupon-review-link').href = review || 'reviews.html';
      modal.querySelector('#coupon-modal-note').textContent = 'Copy this code, open the provider in a new tab, and apply it at checkout. Verify the final total before buying.';
      modal.querySelector('.copy-modal-code').style.display = '';
      modal.querySelector('.copy-modal-code').textContent = 'Copy';

      trackAffiliateClick(provider, 'coupon_reveal_' + title, url);

      modal.classList.add('active');
      document.body.classList.add('coupon-modal-open');
      modal.querySelector('.coupon-modal-close').focus();
    }

    // Delegated listener works for every current and future coupon card.
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.show-code-btn');
      if (!button) return;
      event.preventDefault();
      openCouponModal(button);
    });
  });
})();
