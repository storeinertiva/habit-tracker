const modal = document.getElementById('paymentModal');
const buyBtn = document.getElementById('buyBtn');
const buyBtnTop = document.getElementById('buyBtnTop');
const payNowBtn = document.getElementById('payNowBtn');
const modalBackdrop = document.querySelector('#paymentModal .modal-backdrop');

const previewButton = document.getElementById('openPreview');
const previewNavButton = document.getElementById('openPreviewNav');
const previewLightbox = document.getElementById('previewLightbox');
const closePreview = document.getElementById('closePreview');
const previewBackdrop = document.querySelector('.lightbox-backdrop');

const downloadSection = document.getElementById('downloadSection');
let razorpayKeyId = '';

fetch('/api/product')
  .then((res) => res.json())
  .then((data) => {
    const priceEl = document.getElementById('price');
    if (priceEl) priceEl.innerText = '₹' + data.price;
    razorpayKeyId = data.key || '';
  })
  .catch(() => {});

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

payNowBtn.onclick = async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name || !email) {
    alert('Please enter name and email.');
    return;
  }

  const res = await fetch('/api/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email })
  });

  const order = await res.json();
  if (!res.ok) {
    alert(order.error || 'Unable to create order.');
    return;
  }

  const options = {
    key: razorpayKeyId,
    amount: order.amount,
    currency: 'INR',
    name: 'Inertiva',
    description: 'Excel Habit Tracker',
    order_id: order.id,
    handler: async function (response) {
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...response,
          name,
          email
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        alert(verifyData.error || 'Payment verification failed.');
        return;
      }

      localStorage.setItem('purchaseSuccess', '1');
      window.location.href = '/';
    },
    prefill: {
      name,
      email
    }
  };

  const rzp = new Razorpay(options);
  rzp.open();
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
