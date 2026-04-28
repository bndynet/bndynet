function getCurrentTheme() {
  return localStorage.getItem('theme') ?? 'light'; // light or dark
}

function appendThemeToUrl(url) {
  if (!url) return url;

  const theme = getCurrentTheme() ?? 'light';

  let newUrl = url;
  // changing src will reload the iframe
  const hasTheme =
    new URLSearchParams(new URL(newUrl).search).get('theme') !== null;
  if (hasTheme) {
    newUrl = newUrl.replace(/theme[^&]*/, `theme=${theme}`);
  }
  // for codesandbox.io (code-editor component)
  if (newUrl.includes('codesandbox')) {
    if (newUrl.includes('theme=')) {
      newUrl = newUrl.replace(/theme=[^&]*/, `theme=${theme}`);
    } else {
      newUrl = newUrl + (newUrl.includes('?') ? '&' : '?') + `theme=${theme}`;
    }
  }
  return newUrl;
}

function appendThemeForIframes() {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const src = iframe.src;
    const newSrc = appendThemeToUrl(src);
    if (src && src !== newSrc) {
      iframe.src = newSrc;
    }
    postThemeChangedToIframe(iframe.contentWindow);
  });
}

function postThemeChangedToIframe(iframeContentWindow) {
  const theme = getCurrentTheme();
  iframeContentWindow.postMessage({ type: 'themeChanged', theme }, '*');
}
