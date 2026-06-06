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
