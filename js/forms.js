/* Form submissions → support@bathprofessional.com via FormSubmit */
(function () {
  'use strict';

  const FORM_EMAIL = 'support@bathprofessional.com';
  const FORM_ENDPOINT = `https://formsubmit.co/ajax/${FORM_EMAIL}`;

  function isFileProtocol() {
    return window.location.protocol === 'file:';
  }

  async function sendToSupport(payload) {
    if (isFileProtocol()) {
      throw new Error(
        'Forms must be opened through a web server (not as a saved HTML file). Use http://localhost:8080 locally, or upload the site to your web host.'
      );
    }

    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      throw new Error('Unexpected response from the form service.');
    }

    if (data.success === 'true' || data.success === true) {
      return data;
    }

    throw new Error(data.message || 'Submission failed. Please try again or contact us by phone.');
  }

  function setStatus(el, message, type) {
    if (!el) return;
    el.textContent = message;
    el.classList.remove('hidden', 'success', 'error', 'pending');
    el.classList.add(type);
  }

  function friendlyError(err) {
    const msg = err?.message || '';
    if (msg.includes('Activation')) {
      return 'Almost ready! Check support@bathprofessional.com for a FormSubmit activation email and click the link once. After that, online forms will work on localhost and your live website.';
    }
    if (msg.includes('web server')) {
      return msg;
    }
    return msg || 'Could not send online. Please call (407) 421-5844, or email support@bathprofessional.com directly.';
  }

  // Show success if redirected back after standard form post
  if (window.location.search.includes('sent=1')) {
    const contactStatus = document.getElementById('contactFormStatus');
    setStatus(contactStatus, 'Thank you! Your message was sent. We\'ll reply shortly.', 'success');
    contactStatus?.classList.remove('hidden');
    history.replaceState(null, '', window.location.pathname + window.location.hash);
  }

  // ─── Contact form (#contact) ───
  const contactForm = document.getElementById('contactForm');
  const contactStatus = document.getElementById('contactFormStatus');
  const contactBtn = document.getElementById('contactSubmitBtn');

  contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('cfName')?.value.trim();
    const email = document.getElementById('cfEmail')?.value.trim();
    const phone = document.getElementById('cfPhone')?.value.trim();
    const zipCode = document.getElementById('cfZipCode')?.value.trim();
    const message = document.getElementById('cfMessage')?.value.trim();

    if (!name || !email || !phone || !zipCode || !message) {
      setStatus(contactStatus, 'Please fill in all fields.', 'error');
      contactStatus?.classList.remove('hidden');
      return;
    }

    contactBtn.disabled = true;
    setStatus(contactStatus, 'Sending your message…', 'pending');
    contactStatus?.classList.remove('hidden');

    try {
      await sendToSupport({
        _subject: 'New Contact Message — Bath Professional Website',
        _template: 'table',
        _captcha: 'false',
        name,
        email,
        phone,
        zip_code: zipCode,
        message,
      });

      contactForm.reset();
      setStatus(contactStatus, 'Thank you! Your message was sent to our team. We\'ll reply shortly.', 'success');
    } catch (err) {
      setStatus(contactStatus, friendlyError(err), 'error');
    } finally {
      contactBtn.disabled = false;
    }
  });

})();