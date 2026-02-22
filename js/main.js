/* =============================================
   PORTFOLIO — main.js
   DOM Manipulation & Interactive Features
============================================= */

'use strict';

/* ===== 1. DYNAMIC FOOTER YEAR ===== */
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ===== 2. DARK / LIGHT MODE TOGGLE ===== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = themeToggle ? themeToggle.querySelector('.theme-icon') : null;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeIcon) themeIcon.textContent = (theme === 'dark') ? '🌙' : '☀️';
  localStorage.setItem('portfolio-theme', theme);
}

// Load saved theme
const savedTheme = localStorage.getItem('portfolio-theme') ||
                   (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}


/* ===== 3. MOBILE MENU TOGGLE ===== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);
    // Animate hamburger bars
    const bars = hamburger.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    });
  });
}


/* ===== 4. NAVBAR SCROLL EFFECT ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }
});


/* ===== 5. SKILL BAR ANIMATION (Intersection Observer) ===== */
const skillBars = document.querySelectorAll('.skill-progress');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const bar   = entry.target;
      const width = bar.getAttribute('data-width');
      bar.style.width = width + '%';
      skillObserver.unobserve(bar);
    }
  });
}, { threshold: 0.3 });

skillBars.forEach(bar => skillObserver.observe(bar));


/* ===== 6. GPA CALCULATOR ===== */

function markToGPA(mark) {
  if (mark >= 85) return 4.0;
  if (mark >= 75) return 3.5;
  if (mark >= 65) return 3.0;
  if (mark >= 55) return 2.5;
  if (mark >= 45) return 2.0;
  return 0.0;
}

function gpaToClassification(gpa) {
  if (gpa >= 3.6) return { label: '🏆 First Class', color: '#27632a' };
  if (gpa >= 3.0) return { label: '🎖️ Upper Second Class', color: '#1a5c80' };
  if (gpa >= 2.5) return { label: '📘 Lower Second Class', color: '#5a3f0d' };
  if (gpa >= 2.0) return { label: '✅ Pass', color: '#3d6b4f' };
  return { label: '❌ Fail', color: '#842029' };
}

function removeRow(btn) {
  const rows = document.querySelectorAll('.course-row');
  if (rows.length <= 1) {
    showCalcError('You need at least one course row.');
    return;
  }
  btn.closest('.course-row').remove();
  clearCalcError();
}

function showCalcError(msg) {
  const el = document.getElementById('calcError');
  if (el) el.textContent = msg;
}

function clearCalcError() {
  const el = document.getElementById('calcError');
  if (el) el.textContent = '';
}

// Add course row
const addCourseBtn = document.getElementById('addCourse');
if (addCourseBtn) {
  addCourseBtn.addEventListener('click', () => {
    const container = document.getElementById('courseInputs');
    const row = document.createElement('div');
    row.className = 'course-row';
    row.innerHTML = `
      <div class="calc-field">
        <label>Course Name</label>
        <input type="text" class="course-name" placeholder="e.g. Database Systems" />
      </div>
      <div class="calc-field calc-field--small">
        <label>Credits</label>
        <input type="number" class="course-credits" placeholder="3" min="1" max="6" />
      </div>
      <div class="calc-field calc-field--small">
        <label>Mark (%)</label>
        <input type="number" class="course-mark" placeholder="75" min="0" max="100" />
      </div>
      <button class="remove-row" onclick="removeRow(this)" aria-label="Remove course">✕</button>
    `;
    container.appendChild(row);
    row.querySelector('.course-name').focus();
    clearCalcError();
  });
}

// Calculate GPA
const calcBtn = document.getElementById('calculateGPA');
if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const rows    = document.querySelectorAll('.course-row');
    let totalGPA  = 0;
    let totalCreds = 0;
    let hasError  = false;
    let courses   = [];

    clearCalcError();

    // Reset error highlights
    document.querySelectorAll('.course-mark, .course-credits').forEach(el => {
      el.classList.remove('error');
    });

    rows.forEach((row, idx) => {
      const nameEl    = row.querySelector('.course-name');
      const creditsEl = row.querySelector('.course-credits');
      const markEl    = row.querySelector('.course-mark');

      const name    = nameEl.value.trim() || `Course ${idx + 1}`;
      const credits = parseFloat(creditsEl.value);
      const mark    = parseFloat(markEl.value);

      if (isNaN(credits) || credits < 1 || credits > 6) {
        creditsEl.classList.add('error');
        hasError = true;
      }

      if (isNaN(mark) || mark < 0 || mark > 100) {
        markEl.classList.add('error');
        hasError = true;
      }

      if (!isNaN(credits) && !isNaN(mark)) {
        const gpa = markToGPA(mark);
        courses.push({ name, credits, mark, gpa });
        totalGPA   += gpa * credits;
        totalCreds += credits;
      }
    });

    if (hasError) {
      showCalcError('⚠️ Please fix the highlighted fields. Credits must be 1–6, marks must be 0–100.');
      return;
    }

    if (totalCreds === 0) {
      showCalcError('⚠️ Please enter at least one course with valid credits and mark.');
      return;
    }

    const finalGPA     = (totalGPA / totalCreds).toFixed(2);
    const classification = gpaToClassification(parseFloat(finalGPA));

    // Build summary
    let summary = courses.map(c =>
      `${c.name}: ${c.mark}% → GPA ${c.gpa.toFixed(1)} (${c.credits} cr)`
    ).join(' &nbsp;|&nbsp; ');

    // Display result
    const resultEl  = document.getElementById('calcResult');
    const gpaValEl  = document.getElementById('gpaValue');
    const classEl   = document.getElementById('classValue');
    const summaryEl = document.getElementById('resultSummary');

    gpaValEl.textContent  = finalGPA;
    classEl.textContent   = classification.label;
    classEl.style.background = classification.color;
    summaryEl.innerHTML   = summary;

    resultEl.classList.add('visible');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}


/* ===== 7. CONTACT FORM VALIDATION ===== */
const contactForm = document.getElementById('contactForm');

function validateField(inputId, errorId, validatorFn) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (!input || !error) return false;

  const msg = validatorFn(input.value.trim());
  if (msg) {
    input.classList.add('error');
    error.textContent = msg;
    return false;
  } else {
    input.classList.remove('error');
    error.textContent = '';
    return true;
  }
}

function validateEmail(val) {
  if (!val) return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(val) ? '' : 'Please enter a valid email address.';
}

if (contactForm) {
  // Live validation on blur
  contactForm.querySelector('#contactName').addEventListener('blur', () => {
    validateField('contactName', 'nameError', v => v ? '' : 'Name is required.');
  });
  contactForm.querySelector('#contactEmail').addEventListener('blur', () => {
    validateField('contactEmail', 'emailError', validateEmail);
  });
  contactForm.querySelector('#contactSubject').addEventListener('blur', () => {
    validateField('contactSubject', 'subjectError', v => v ? '' : 'Subject is required.');
  });
  contactForm.querySelector('#contactMessage').addEventListener('blur', () => {
    validateField('contactMessage', 'messageError', v =>
      v.length >= 10 ? '' : 'Message must be at least 10 characters.');
  });

  // Submit
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const validName    = validateField('contactName',    'nameError',    v => v ? '' : 'Name is required.');
    const validEmail   = validateField('contactEmail',   'emailError',   validateEmail);
    const validSubject = validateField('contactSubject', 'subjectError', v => v ? '' : 'Subject is required.');
    const validMessage = validateField('contactMessage', 'messageError', v =>
      v.length >= 10 ? '' : 'Message must be at least 10 characters.');

    if (validName && validEmail && validSubject && validMessage) {
      const successEl = document.getElementById('formSuccess');
      const submitBtn = contactForm.querySelector('.form-submit');

      submitBtn.disabled     = true;
      submitBtn.textContent  = 'Sending...';

      // Simulate sending (no backend)
      setTimeout(() => {
        submitBtn.style.display = 'none';
        if (successEl) successEl.style.display = 'block';
        contactForm.reset();
        document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
        document.querySelectorAll('input.error, textarea.error').forEach(el => el.classList.remove('error'));
      }, 900);
    }
  });
}


/* ===== 8. CV DOWNLOAD (Print) ===== */
const downloadCVBtn = document.getElementById('downloadCV');
if (downloadCVBtn) {
  downloadCVBtn.addEventListener('click', () => {
    // Temporarily show only the CV preview for printing
    const body   = document.body;
    const cvElem = document.getElementById('cvPreview');

    if (!cvElem) { window.print(); return; }

    // Clone and inject a minimal print page
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>UWAMWEZI SOLANGE — CV</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', Arial, sans-serif; color: #1e1e1e; padding: 32px; font-size: 13px; }
          h2 { font-family: Georgia, serif; font-size: 28px; }
          h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #3d6b4f; margin: 12px 0 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
          .cv-header { display: flex; justify-content: space-between; padding-bottom: 14px; border-bottom: 3px solid #3d6b4f; margin-bottom: 20px; }
          .cv-name-block p { color: #666; font-size: 12px; margin-top: 4px; }
          .cv-contact-block { text-align: right; font-size: 11px; color: #666; line-height: 1.8; }
          .cv-body { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; }
          .cv-date { font-size: 11px; color: #c17f3e; font-weight: 700; display: block; margin-bottom: 2px; }
          .cv-entry { margin-bottom: 12px; }
          .cv-entry strong { display: block; font-size: 12px; margin-bottom: 2px; }
          .cv-entry p { font-size: 11px; color: #555; }
          .cv-skills-list { display: flex; flex-wrap: wrap; gap: 5px; }
          .cv-skills-list span { font-size: 10px; padding: 3px 8px; background: #e8f2ec; color: #3d6b4f; border-radius: 100px; }
        </style>
      </head>
      <body>${cvElem.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 300);
  });
}


/* ===== 9. SECTION FADE-IN ANIMATION ===== */
const sections = document.querySelectorAll('.section');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeUp 0.6s ease both';
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

sections.forEach(sec => {
  sec.style.opacity = '0';
  sectionObserver.observe(sec);
});

// Kick-off already visible sections immediately
window.addEventListener('load', () => {
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      sec.style.animation = 'none';
      sec.style.opacity   = '1';
    }
  });
});
