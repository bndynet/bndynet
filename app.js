// this file only loaded first time when site is loaded, some functions defined in script.js

import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

// built-in hook for route changes of Docusaurus PJAX navigation
export function onRouteDidUpdate({ location, previousLocation }) {
  if (!ExecutionEnvironment.canUseDOM) {
    return;
  }

  const isFirstLoad = previousLocation == null;
  const targetPath = location.pathname;
  const prevPath = isFirstLoad ? null : previousLocation.pathname;

  window.appendThemeForIframes(getCurrentTheme?.() || 'light');
}

if (ExecutionEnvironment.canUseDOM) {
  // EVENT_THEME_CHANGE = 'themeChanged' defined in /src/theme/ColorModeToggle/index.tsx
  window.addEventListener('themeChanged', (event) => {
    const theme = event.detail.theme;
    appendThemeForIframes(theme);

    // TODO: Add your custom logic here for theme change
  });

  // if the iframe requests the current theme
  window.addEventListener('message', (event) => {
    const type = event.data.type;
    const iframeContentWindow = event.source;
    if (type === 'requestTheme') {
      postThemeChangedToIframe(iframeContentWindow);
    }
  });
}
