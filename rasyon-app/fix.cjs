const fs = require('fs');
const file = 'src/ui/app.js';
let data = fs.readFileSync(file, 'utf8');

// Fix theme toggle
data = data.replace(
  "document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);",
  "document.addEventListener('click', (e) => { if (e.target.closest('#theme-toggle')) toggleTheme(); });"
);

// Fix double toast
data = data.replace(
  "    onOfflineReady() {\r\n      showToast('Uygulama çevrimdışı kullanım için hazır.', 'success');\r\n    },",
  "    let offlineReadyToastShown = false;\r\n    onOfflineReady() {\r\n      if (!offlineReadyToastShown) {\r\n        showToast('Uygulama çevrimdışı kullanım için hazır.', 'success');\r\n        offlineReadyToastShown = true;\r\n      }\r\n    },"
);
// In case it's \n instead of \r\n
data = data.replace(
  "    onOfflineReady() {\n      showToast('Uygulama çevrimdışı kullanım için hazır.', 'success');\n    },",
  "    let offlineReadyToastShown = false;\n    onOfflineReady() {\n      if (!offlineReadyToastShown) {\n        showToast('Uygulama çevrimdışı kullanım için hazır.', 'success');\n        offlineReadyToastShown = true;\n      }\n    },"
);

fs.writeFileSync(file, data, 'utf8');
console.log('Done');
