const fs = require('fs');
const filePath = 'app/page.js';
let content = fs.readFileSync(filePath, 'utf8');

const searchRegex = /\{\/\* Category tabs \*\/\}[\s\S]*?\{\/\* Destination dropdown filter \*\/\}[\s\S]*?\}\)/;

const uiReplace = `{/* Category tabs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => setActiveDest('all')}
                style={{
                  padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeDest === 'all' ? 'linear-gradient(135deg,#7e5233,#c93d00)' : '#f5f0e8',
                  color: activeDest === 'all' ? '#fff' : '#555',
                }}>
                All Categories
              </button>
              {destinations.map(d => (
                <button
                  key={d.id}
                  onClick={() => setActiveDest(d.name)}
                  style={{
                    padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: activeDest === d.name ? 'linear-gradient(135deg,#7e5233,#c93d00)' : '#f5f0e8',
                    color: activeDest === d.name ? '#fff' : '#555',
                  }}>
                  {d.name}
                </button>
              ))}
            </div>`;

// Safely split at exact landmarks
const part1 = content.split('{/* Category tabs */}');
if (part1.length === 2) {
  const part2 = part1[1].split('          </div>\n\n          {!pkgsLoaded ? (');
  if (part2.length === 2) {
    // part2[0] contains the exact UI to replace
    content = part1[0] + uiReplace + '\n          </div>\n\n          {!pkgsLoaded ? (' + part2[1];
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('UI updated successfully');
