const previewButton = document.getElementById('openPreview');
const previewNavButton = document.getElementById('openPreviewNav');
const previewLightbox = document.getElementById('previewLightbox');
const closePreview = document.getElementById('closePreview');
const previewBackdrop = document.querySelector('.lightbox-backdrop');

function openPreview() {
  previewLightbox.classList.add('open');
  previewLightbox.setAttribute('aria-hidden', 'false');
}

function closePreviewModal() {
  previewLightbox.classList.remove('open');
  previewLightbox.setAttribute('aria-hidden', 'true');
}

if (previewButton) previewButton.addEventListener('click', openPreview);
if (previewNavButton) previewNavButton.addEventListener('click', openPreview);
if (closePreview) closePreview.addEventListener('click', closePreviewModal);

if (previewBackdrop) {
  previewBackdrop.addEventListener('click', (event) => {
    if (event.target.dataset.close) closePreviewModal();
  });
}

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});
