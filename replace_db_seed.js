const fs = require('fs');
const filePath = 'lib/db.js';
let content = fs.readFileSync(filePath, 'utf8');

const search = `      INSERT INTO destinations (name, color, image_url, description, emoji) VALUES
        ('Munnar',      '#2e9e7a', 'https://images.unsplash.com/photo-1585394365777-e81a5f5bf68a?w=800&q=80', 'Misty tea gardens, waterfalls & cool hill breezes', '🍃'),
        ('Alleppey',    '#e8520a', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'Tranquil backwaters, houseboats & village life', '🛶'),
        ('Wayanad',     '#2e3da8', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80', 'Dense forests, tribal culture & misty mornings', '🌿')
      ON CONFLICT DO NOTHING`;

const replace = `      INSERT INTO destinations (name, color, image_url, description, emoji) VALUES
        ('Domestic',      '#153e2d', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80', 'Explore the beauty within your borders', '🇮🇳'),
        ('International', '#7e5233', 'https://images.unsplash.com/photo-1585394365777-e81a5f5bf68a?w=800&q=80', 'Discover exotic destinations around the world', '✈️'),
        ('Spiritual',     '#e8520a', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 'Find peace and serenity in sacred places', '🕉️')
      ON CONFLICT DO NOTHING`;

if(content.includes(search)) {
  content = content.replace(search, replace);
  // Also remove the else block that updates Munnar, Alleppey, Wayanad
  const elseSearch = `  } else {
    await pool.query(\`UPDATE destinations SET image_url='https://images.unsplash.com/photo-1585394365777-e81a5f5bf68a?w=800&q=80', description='Misty tea gardens, waterfalls & cool hill breezes', emoji='🍃' WHERE name='Munnar' AND image_url IS NULL\`)
    await pool.query(\`UPDATE destinations SET image_url='https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', description='Tranquil backwaters, houseboats & village life', emoji='🛶' WHERE name='Alleppey' AND image_url IS NULL\`)
    await pool.query(\`UPDATE destinations SET image_url='https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80', description='Dense forests, tribal culture & misty mornings', emoji='🌿' WHERE name='Wayanad' AND image_url IS NULL\`)
  }`;
  content = content.replace(elseSearch, '  }');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Seed replaced');
} else {
  console.log('Seed not found');
}
