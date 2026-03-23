const fs = require('fs');
const path = require('path');
const db = require('./db');

const subjects = ['English', 'Mathematics I', 'Physics', 'Programming for Problem Solving'];
const regulation = 'R19';
const year = '1';
const semester = '1';

async function seed() {
  try {
    // get admin user
    const res = await db.query("SELECT id FROM profiles WHERE role = 'admin' LIMIT 1");
    let adminId = null;
    if (res.rows.length > 0) adminId = res.rows[0].id;
    
    for (const subject of subjects) {
      const uploadPath = path.join(__dirname, 'uploads', regulation, year, semester, subject);
      fs.mkdirSync(uploadPath, { recursive: true });
      
      // create a clean timestamp for the filename to mimic real uploads
      const timestamp = Date.now();
      const fileName = `${timestamp}-${Math.round(Math.random() * 1E9)}-Unit_1.pdf`;
      const filePath = path.join(uploadPath, fileName);
      
      // create dummy pdf file
      fs.writeFileSync(filePath, '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n1 0 obj\n<< /Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<< /Type /Pages\n/Kids [3 0 R]\n/Count 1\n/MediaBox [0 0 595.28 841.89]\n>>\nendobj\n3 0 obj\n<< /Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<< /Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Mock Unit 1 PDF) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000015 00000 n \n0000000068 00000 n \n0000000157 00000 n \n0000000281 00000 n \n0000000370 00000 n \ntrailer\n<< /Size 6\n/Root 1 0 R\n>>\nstartxref\n465\n%%EOF');
      
      const fileUrl = `/uploads/${regulation}/${year}/${semester}/${subject}/${fileName}`;
      const title = `${subject} Unit 1 PDF`;
      
      await db.query(`
        INSERT INTO files (title, description, file_url, regulation, year, semester, subject, uploaded_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [title, 'Mock Unit 1 Notes', fileUrl, regulation, year, semester, subject, adminId]);
      
      console.log(`Inserted mock data for ${subject}`);
    }
    console.log('Seeding completed successfully.');
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}

seed();
