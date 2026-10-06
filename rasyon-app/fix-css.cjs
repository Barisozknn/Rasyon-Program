const fs = require('fs');
const file = 'src/ui/styles.css';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  ".dash-stats-row {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .dash-stats-row {\r\n    grid-template-columns: repeat(2, 1fr);\r\n  }\r\n  gap: 0.5rem;\r\n}",
  ".dash-stats-row {\r\n  display: grid;\r\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\r\n  gap: 0.5rem;\r\n}\r\n\r\n@media (max-width: 480px) {\r\n  .dash-stats-row {\r\n    grid-template-columns: repeat(2, 1fr);\r\n  }\r\n}"
);

// also fallback for LF
data = data.replace(
  ".dash-stats-row {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\n}\n\n@media (max-width: 480px) {\n  .dash-stats-row {\n    grid-template-columns: repeat(2, 1fr);\n  }\n  gap: 0.5rem;\n}",
  ".dash-stats-row {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));\n  gap: 0.5rem;\n}\n\n@media (max-width: 480px) {\n  .dash-stats-row {\n    grid-template-columns: repeat(2, 1fr);\n  }\n}"
);

// and fix dash-stat-val to clamp
data = data.replace(
  ".dash-stat-val {\r\n  font-size: 1.35rem;\r\n  font-weight: 700;\r\n  color: var(--primary-dark);\r\n  font-family: var(--font-mono);\r\n  line-height: 1.1;\r\n}",
  ".dash-stat-val {\r\n  font-size: clamp(1rem, 4vw, 1.35rem);\r\n  font-weight: 700;\r\n  color: var(--primary-dark);\r\n  font-family: var(--font-mono);\r\n  line-height: 1.1;\r\n  word-break: break-word;\r\n}"
);
data = data.replace(
  ".dash-stat-val {\n  font-size: 1.35rem;\n  font-weight: 700;\n  color: var(--primary-dark);\n  font-family: var(--font-mono);\n  line-height: 1.1;\n}",
  ".dash-stat-val {\n  font-size: clamp(1rem, 4vw, 1.35rem);\n  font-weight: 700;\n  color: var(--primary-dark);\n  font-family: var(--font-mono);\n  line-height: 1.1;\n  word-break: break-word;\n}"
);

fs.writeFileSync(file, data, 'utf8');
console.log('Fixed CSS');
