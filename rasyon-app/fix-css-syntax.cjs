const fs = require('fs');
const file = 'src/ui/styles.css';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  ".dash-stats-row {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\n}\n\n@media (max-width: 480px) {\n  .dash-stats-row {\n    grid-template-columns: repeat(2, 1fr);\n  }\n  gap: 0.5rem;\n}",
  ".dash-stats-row {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\n  gap: 0.5rem;\n}\n\n@media (max-width: 480px) {\n  .dash-stats-row {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}"
);

data = data.replace(
  ".dash-stats-row {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .dash-stats-row {\r\n    grid-template-columns: repeat(2, 1fr);\r\n  }\r\n  gap: 0.5rem;\r\n}",
  ".dash-stats-row {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\r\n  gap: 0.5rem;\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .dash-stats-row {\r\n    grid-template-columns: repeat(2, 1fr);\r\n  }\r\n}"
);

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed CSS syntax');
