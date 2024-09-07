const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // PostgreSQL client for Node.js

const app = express();
app.use(bodyParser.json());

// Connect to PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Managed DB URL
});

app.post('/anagram', async (req, res) => {
  const word = req.body.word;
  
  // Function to find anagrams
  const findAnagrams = (word) => {
    if (word.length < 2) return [word];
    let anagrams = [];
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      const remainingChars = word.slice(0, i) + word.slice(i + 1);
      const remainingAnagrams = findAnagrams(remainingChars);
      remainingAnagrams.forEach(subAnagram => anagrams.push(char + subAnagram));
    }
    return anagrams;
  };

  const anagrams = findAnagrams(word);

  // Save the anagrams to the database
  try {
    await pool.query('INSERT INTO anagrams (word, anagram) VALUES ($1, $2)', [word, JSON.stringify(anagrams)]);
    res.status(200).json({ success: true, anagrams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Listen on port
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
