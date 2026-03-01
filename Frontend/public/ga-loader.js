(function() {
  function loadGA() {
    var s = document.createElement('script');
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-3Q2BQ64DRC';
    s.async = true;
    document.head.appendChild(s);
    s.onload = function() {
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-3Q2BQ64DRC', { send_page_view: false });
    };
  }
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(loadGA, { timeout: 4000 });
  } else {
    setTimeout(loadGA, 3500);
  }
})();
