const modal = document.getElementById('purchaseModal');
const openButtons = [
  document.getElementById('openModal'),
  document.getElementById('openModalTop')
];
const closeButton = document.getElementById('closeModal');
const backdrop = document.querySelector('.modal-backdrop');

const stepForm = document.getElementById('stepForm');
const stepPayment = document.getElementById('stepPayment');
const stepSuccess = document.getElementById('stepSuccess');

const buyerForm = document.getElementById('buyerForm');
const formError = document.getElementById('formError');
const paymentError = document.getElementById('paymentError');
const confirmPaid = document.getElementById('confirmPaid');
const downloadLink = document.getElementById('downloadLink');
const paymentStatus = document.getElementById('paymentStatus');

const previewButton = document.getElementById('openPreview');
const previewNavButton = document.getElementById('openPreviewNav');
const previewLightbox = document.getElementById('previewLightbox');
const closePreview = document.getElementById('closePreview');
const previewBackdrop = document.querySelector('.lightbox-backdrop');

let currentBuyerId = null;

function openModal() {
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  resetSteps();
}

function resetSteps() {
  stepForm.classList.remove('hidden');
  stepPayment.classList.add('hidden');
  stepSuccess.classList.add('hidden');
  formError.textContent = '';
  paymentError.textContent = '';
  if (paymentStatus) paymentStatus.textContent = '';
  buyerForm.reset();
  currentBuyerId = null;
}

function showStep(step) {
  stepForm.classList.add('hidden');
  stepPayment.classList.add('hidden');
  stepSuccess.classList.add('hidden');
  step.classList.remove('hidden');
}

openButtons.forEach((button) => button && button.addEventListener('click', openModal));
closeButton.addEventListener('click', closeModal);
backdrop.addEventListener('click', (event) => {
  if (event.target.dataset.close) closeModal();
});

buyerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';

  const formData = new FormData(buyerForm);
  const payload = {
    fullName: formData.get('fullName').trim(),
    email: formData.get('email').trim()
  };

  if (!payload.fullName || !payload.email) {
    formError.textContent = 'Please provide your name and email.';
    return;
  }

  try {
    const response = await fetch('/api/buyers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to save buyer.');

    currentBuyerId = data.buyerId;
    showStep(stepPayment);
  } catch (err) {
    formError.textContent = err.message;
  }
});

confirmPaid.addEventListener('click', async () => {
  paymentError.textContent = '';
  if (paymentStatus) {
    paymentStatus.textContent = 'Confirming payment... this usually takes 3–10 seconds.';
  }
  confirmPaid.disabled = true;
  confirmPaid.textContent = 'Processing...';

  if (!currentBuyerId) {
    paymentError.textContent = 'Missing buyer info. Please restart the purchase.';
    confirmPaid.disabled = false;
    confirmPaid.textContent = 'I\'ve Paid';
    return;
  }

  try {
    const buyerId = currentBuyerId;
    const response = await fetch('/api/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ buyerId })
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('Server returned non-JSON response for payment confirmation.');
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Unable to confirm payment.');

    downloadLink.href = data.downloadUrl;
    showStep(stepSuccess);
    if (paymentStatus) {
      paymentStatus.textContent = '';
    }
  } catch (err) {
    paymentError.textContent = err.message;
    if (paymentStatus) {
      paymentStatus.textContent = '';
    }
  } finally {
    confirmPaid.disabled = false;
    confirmPaid.textContent = 'I’ve Paid';
  }
});

window.addEventListener('load', () => {
  document.body.classList.add('loaded');
});

function openPreview() {
  previewLightbox.classList.add('open');
  previewLightbox.setAttribute('aria-hidden', 'false');
}

function closePreviewModal() {
  previewLightbox.classList.remove('open');
  previewLightbox.setAttribute('aria-hidden', 'true');
}

if (previewButton) {
  previewButton.addEventListener('click', openPreview);
}

if (previewNavButton) {
  previewNavButton.addEventListener('click', openPreview);
}

if (closePreview) {
  closePreview.addEventListener('click', closePreviewModal);
}

if (previewBackdrop) {
  previewBackdrop.addEventListener('click', (event) => {
    if (event.target.dataset.close) closePreviewModal();
  });
}
