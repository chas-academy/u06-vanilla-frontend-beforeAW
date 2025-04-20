const openModalBtn = document.getElementById('open-modal-btn') as HTMLButtonElement;
const closeModalBtn = document.getElementById('close-modal-btn') as HTMLSpanElement;
const modal = document.getElementById('modal') as HTMLDivElement;

// Open modal
openModalBtn.addEventListener('click', () => {
  modal.classList.remove('hidden');
});

// Close modal
closeModalBtn.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
  }
});