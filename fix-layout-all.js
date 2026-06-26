const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if(file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('app/admin');
for(const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  if(content.includes('DashboardLayout')) {
    content = content.replace(/import DashboardLayout from "@\/components\/DashboardLayout";\r?\n/g, '');
    content = content.replace(/<DashboardLayout>/g, '<>');
    content = content.replace(/<\/DashboardLayout>/g, '</>');
    fs.writeFileSync(f, content, 'utf8');
    console.log('Fixed', f);
  }
}
