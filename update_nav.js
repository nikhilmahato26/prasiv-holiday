const fs = require('fs');
const filePath = 'components/Navbar.js';
let content = fs.readFileSync(filePath, 'utf8');

const search = `          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 group">
            <div className="w-16 h-16 overflow-hidden shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Triphoga"
                width={64} height={64}
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="font-bold text-lg md:text-3xl leading-tight hidden sm:block"
              style={{ fontFamily: 'Poppins, sans-serif', color: scrolled ? '#1a3c2e' : '#fff' }}
            >
              Triphoga<br />
              <span style={{ color: '#7e5233', fontWeight: 700 }}>Trips</span>
            </span>
          </Link>`;

const replace = `          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 group">
            <div className="w-16 h-16 md:w-20 md:h-20 overflow-hidden shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Triphoga"
                width={80} height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <span
              className="font-bold text-base md:text-xl leading-tight hidden sm:block"
              style={{ fontFamily: 'Poppins, sans-serif', color: scrolled ? '#153e2d' : '#fff' }}
            >
              Triphoga
            </span>
          </Link>`;

if (content.includes(search)) {
  content = content.replace(search, replace);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Navbar updated');
} else {
  console.log('Search string not found in Navbar.js');
}
