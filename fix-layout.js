const fs = require('fs');
const files = [
  'app/admin/user/show/[id]/page.tsx',
  'app/admin/user/page.tsx',
  'app/admin/user/edit/[id]/page.tsx',
  'app/admin/user/create/page.tsx',
  'app/admin/data-apikey/show/[id]/page.tsx',
  'app/admin/data-apikey/page.tsx',
  'app/admin/data-apikey/edit/[id]/page.tsx',
  'app/admin/data-apikey/create/page.tsx'
];
for(const f of files) {
  if(!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/import DashboardLayout from "@\/components\/DashboardLayout";\r?\n/g, '');
  content = content.replace(/<DashboardLayout>/g, '<>');
  content = content.replace(/<\/DashboardLayout>/g, '</>');
  fs.writeFileSync(f, content, 'utf8');
  console.log('Fixed', f);
}
