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
