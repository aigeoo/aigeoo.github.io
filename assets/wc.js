/* WatchCom Security — تفاعلات الواجهة
   (1) القوائم المنسدلة في الترويسة  (2) قائمة الجوّال  (3) التبويبات */

(function () {
  'use strict';

  /* ---------- (1) القوائم المنسدلة — دعم اللمس بالإضافة إلى المرور ---------- */
  var groups = document.querySelectorAll('.nav-group');
  Array.prototype.forEach.call(groups, function (g) {
    var trigger = g.querySelector('.nav-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var open = g.classList.contains('is-open');
      closeAllGroups();
      if (!open) {
        g.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  function closeAllGroups() {
    Array.prototype.forEach.call(groups, function (g) {
      g.classList.remove('is-open');
      var t = g.querySelector('.nav-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-group')) closeAllGroups();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllGroups();
      closeMobile();
    }
  });

  /* ---------- (2) قائمة الجوّال ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var iconOpen = document.getElementById('iconOpen');
  var iconClose = document.getElementById('iconClose');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var hidden = mobileMenu.hasAttribute('hidden');
      if (hidden) {
        mobileMenu.removeAttribute('hidden');
        menuBtn.setAttribute('aria-expanded', 'true');
      } else {
        closeMobile();
        return;
      }
      if (iconOpen) iconOpen.classList.add('hidden');
      if (iconClose) iconClose.classList.remove('hidden');
    });
  }

  function closeMobile() {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.setAttribute('hidden', '');
    menuBtn.setAttribute('aria-expanded', 'false');
    if (iconOpen) iconOpen.classList.remove('hidden');
    if (iconClose) iconClose.classList.add('hidden');
  }

  /* أكورديون داخل قائمة الجوّال */
  var mGroups = document.querySelectorAll('.m-group > .m-trigger');
  Array.prototype.forEach.call(mGroups, function (t) {
    t.addEventListener('click', function () {
      var g = t.parentElement;
      var open = g.classList.toggle('is-open');
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- (3) التبويبات ---------- */
  var tabLists = document.querySelectorAll('[data-tabs]');
  Array.prototype.forEach.call(tabLists, function (root) {
    var tabs = root.querySelectorAll('.tab');
    var panels = root.querySelectorAll('.tab-panel');

    Array.prototype.forEach.call(tabs, function (tab, i) {
      tab.addEventListener('click', function () { activate(i); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        /* RTL: السهم الأيسر يتقدّم، والأيمن يتراجع */
        if (e.key === 'ArrowLeft') next = i + 1;
        if (e.key === 'ArrowRight') next = i - 1;
        if (next === null) return;
        e.preventDefault();
        if (next < 0) next = tabs.length - 1;
        if (next >= tabs.length) next = 0;
        activate(next);
        tabs[next].focus();
      });
    });

    function activate(index) {
      Array.prototype.forEach.call(tabs, function (t, i) {
        var on = i === index;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.setAttribute('tabindex', on ? '0' : '-1');
      });
      Array.prototype.forEach.call(panels, function (p, i) {
        if (i === index) p.removeAttribute('hidden');
        else p.setAttribute('hidden', '');
      });
    }
  });
})();
