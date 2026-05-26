import { useEffect } from 'react';

export default function InitClientScripts() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.$) {
      const $ = window.$;

      $(document).ready(() => {
        try {
          // ✅ Sticky header
          $('.stricky').scrollToFixed?.();

          // ✅ Remove mobile nav flash (if #page has hidden class)
          $('#page').removeClass('hidden');

          // ✅ Reset body padding (in case of scrollbar shifts)
          $('body').css({ 'padding-right': '0px' });

          // ✅ Remove loader after delay (optional)
          setTimeout(() => {
            const loader = document.getElementById('global-loader');
            if (loader) loader.remove();
          }, 2000);
        } catch (err) {
          console.error('[InitClientScripts] Error:', err);
          document.getElementById('global-loader')?.remove();
        }
      });
    }
  }, []);

  return null;
}
