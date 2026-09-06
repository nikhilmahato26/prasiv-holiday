const fs = require('fs');
const filePath = 'app/admin/dashboard/page.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace Topbar and Section nav with Sidebar layout
const searchLayoutStart = `      {/* Topbar */}
      <div style={S.topbar}>`;

const searchLayoutEnd = `      <div style={S.body}>`;

const layoutRegex = new RegExp(
  searchLayoutStart.replace(/[.*+?^$\{\}\(\)|\[\]\\]/g, '\\$&') + '[\\s\\S]*?' + searchLayoutEnd.replace(/[.*+?^$\{\}\(\)|\[\]\\]/g, '\\$&')
);

const newLayout = `      {/* Sidebar Layout */}
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={{ width: 250, background: '#fff', borderRight: '1px solid #f3f4f6', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: 40, height: 40, overflow: 'hidden', flexShrink: 0 }}>
              <Image src="/logo.jpeg" alt="Triphoga" width={40} height={40} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111', lineHeight: 1 }}>Triphoga Admin</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: '20px 0', overflowY: 'auto' }}>
            {[
              { key: 'packages',      label: 'Packages',     icon: Package,   badge: pendingCount > 0 ? pendingCount : null },
              { key: 'destinations',  label: 'Categories',   icon: MapPin },
              { key: 'enquiries',     label: 'Enquiries',    icon: Inbox,     badge: enquiries.length > 0 && section !== 'enquiries' ? enquiries.length : null },
              { key: 'settings',      label: 'Settings',     icon: Settings },
            ].map(({ key, label, icon: Icon, badge }) => (
              <button key={key} onClick={() => setSection(key)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', fontSize: 13, fontWeight: 600, border: 'none', background: section === key ? '#fbf8f1' : 'transparent', width: '100%', textAlign: 'left', cursor: 'pointer', borderRight: \`3px solid \${section === key ? '#7e5233' : 'transparent'}\`, color: section === key ? '#7e5233' : '#6b7280', position: 'relative' }}>
                <Icon size={16} /> {label}
                {badge && (
                  <span style={{ marginLeft: 'auto', background: '#7e5233', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6' }}>
            <button onClick={logout} style={{ ...S.btn('#fef2f2', '#dc2626'), width: '100%', justifyContent: 'center' }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 40 }}>
            <h1 style={{ fontSize: 16, fontWeight: 700, textTransform: 'capitalize' }}>{section === 'destinations' ? 'Categories' : section}</h1>
            <Link href="/" target="_blank" style={{ ...S.btn('#f3f4f6', '#555'), textDecoration: 'none' }}>
              <ExternalLink size={13} /> View Site
            </Link>
          </div>
          <div style={S.body}>`;

if(layoutRegex.test(content)) {
  content = content.replace(layoutRegex, newLayout);
  // Also we need to close the div at the end since we added `<div style={{ display: 'flex', minHeight: '100vh' }}>`
  // We'll replace the final `</div>\n    </div>` with `</div>\n        </div>\n      </div>\n    </div>`
  content = content.replace(/<\/div>\n    <\/div>\n  \)$/, "</div>\n        </div>\n      </div>\n    </div>\n  )");
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Layout replaced');
} else {
  console.log('Layout regex not found');
}
