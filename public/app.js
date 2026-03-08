const modal = document.getElementById('paymentModal');
const buyBtn = document.getElementById('buyBtn');
const buyBtnTop = document.getElementById('buyBtnTop');
const payBtn = document.getElementById('payBtn');
const modalBackdrop = document.querySelector('#paymentModal .modal-backdrop');

const previewButton = document.getElementById('openPreview');
const previewNavButton = document.getElementById('openPreviewNav');
const previewLightbox = document.getElementById('previewLightbox');
const closePreview = document.getElementById('closePreview');
const previewBackdrop = document.querySelector('.lightbox-backdrop');

const downloadSection = document.getElementById('downloadSection');

function openModal() {
  modal.classList.remove('hidden');
  modal.classList.add('open');
}

function closeModal() {
  modal.classList.remove('open');
  modal.classList.add('hidden');
}

buyBtn.onclick = openModal;
if (buyBtnTop) {
  buyBtnTop.onclick = openModal;
}

if (modalBackdrop) {
  modalBackdrop.onclick = closeModal;
}

function verifyPayment(response, name, email) {
  return fetch('/api/verify-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...response,
      name,
      email
    })
  })
    .then((verifyRes) => verifyRes.json().then((verifyData) => ({ ok: verifyRes.ok, verifyData })))
    .then(({ ok, verifyData }) => {
      if (!ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed.');
      }

      localStorage.setItem('purchaseSuccess', '1');
      window.location.href = '/';
    });
}

payBtn.onclick = () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name || !email) {
    alert('Please enter name and email.');
    return;
  }

  fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  })
    .then((res) => res.json().then((order) => ({ ok: res.ok, order })))
    .then(({ ok, order }) => {
      if (!ok) {
        throw new Error(order.message || order.error || 'Unable to create order');
      }

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID',
        amount: order.order.amount,
        currency: 'INR',
        name: 'Inertiva',
        description: 'Excel Habit Tracker',
        order_id: order.order.id,
        handler: function (response) {
          verifyPayment(response, name, email).catch((err) => {
            alert(err.message || 'Payment verification failed.');
          });
        },
        prefill: {
          name,
          email
        }
      };

      const rzp = new Razorpay(options);
      rzp.open();
    })
    .catch(() => {
      alert('Unable to create order');
    });
};

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
  if (localStorage.getItem('purchaseSuccess') === '1' && downloadSection) {
    downloadSection.classList.remove('hidden');
    localStorage.removeItem('purchaseSuccess');
  }
});
