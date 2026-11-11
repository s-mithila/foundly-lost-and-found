// server/database/seed.js
const bcrypt = require('bcryptjs');

function seedDatabase(db) {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount > 0) {
    return; // Already seeded
  }

  console.log('[Database] Seeding sample Foundly users and campus items...');

  const passwordHash = bcrypt.hashSync('password123', 10);

  // 1. Insert Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, student_id, phone, department, avatar_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    1,
    'Sarah Jenkins',
    'sarah.jenkins@campus.edu',
    passwordHash,
    'student',
    'STU-2024-0418',
    '+1 (555) 234-8901',
    'Computer Science & Engineering',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    2,
    'Alex Chen',
    'alex.chen@campus.edu',
    passwordHash,
    'student',
    'STU-2023-1102',
    '+1 (555) 876-5432',
    'Electrical & Robotics',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    3,
    'Marcus Vance',
    'marcus.vance@campus.edu',
    passwordHash,
    'student',
    'STU-2024-8831',
    '+1 (555) 345-6789',
    'School of Business & Finance',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  );

  insertUser.run(
    4,
    'Officer Robert Davis',
    'security.davis@campus.edu',
    passwordHash,
    'security',
    'SEC-OFFICER-07',
    '+1 (555) 911-4321',
    'Campus Security & Safety Division',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  // 2. Insert Items (Lost & Found)
  const insertItem = db.prepare(`
    INSERT INTO items (
      id, user_id, type, title, category, description,
      location_zone, location_details, date_event, status,
      safe_question, custody_type, custody_location,
      image_url, contact_email, contact_phone, reward_amount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Item 1: LOST MacBook Pro by Sarah
  insertItem.run(
    1,
    1,
    'LOST',
    'Apple MacBook Pro 14" (Space Gray)',
    'Electronics',
    'Space Gray M2 MacBook Pro with a dark grey Tomtoc protective sleeve. Has a small GitHub Octocat sticker on the upper left lid. Extremely important term project data stored inside.',
    'Main Library',
    '2nd Floor Quiet Study Cubicle #14, near the east window row',
    '2026-11-10',
    'MATCH_SUGGESTED',
    null,
    'WITH_FINDER',
    'Last seen at study desk',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    'sarah.jenkins@campus.edu',
    '+1 (555) 234-8901',
    50
  );

  // Item 2: FOUND MacBook by Alex (Matches Item 1!)
  insertItem.run(
    2,
    2,
    'FOUND',
    'Apple Space Gray Laptop with Case',
    'Electronics',
    'Found an Apple laptop in a zipper sleeve left unattended on a desk after library closing. Turned over to desk attendant initially, now kept safe for owner verification.',
    'Main Library',
    'Main Library 2nd Floor study desks',
    '2026-11-10',
    'CLAIM_PENDING',
    'What sticker is on the top lid and what model is written on the zipper sleeve tag?',
    'WITH_FINDER',
    'With Finder (Alex Chen) - contact via Foundly for verified handover',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80',
    'alex.chen@campus.edu',
    '+1 (555) 876-5432',
    0
  );

  // Item 3: LOST Fossil Leather Wallet by Marcus
  insertItem.run(
    3,
    3,
    'LOST',
    'Fossil Men\'s Brown Leather Bi-fold Wallet',
    'Keys & Wallets',
    'Dark brown leather wallet containing university dining card, driver\'s license (Marcus Vance), and debit card. Desperately need the IDs back.',
    'Student Cafeteria',
    'Ground floor seating area near the smoothie counter',
    '2026-11-09',
    'MATCH_SUGGESTED',
    null,
    'WITH_FINDER',
    'Left at cafeteria table',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
    'marcus.vance@campus.edu',
    '+1 (555) 345-6789',
    25
  );

  // Item 4: FOUND Wallet by Officer Davis (Matches Item 3!)
  insertItem.run(
    4,
    4,
    'FOUND',
    'Brown Leather Bi-fold Wallet with Student Cards',
    'Keys & Wallets',
    'Turned in by cafeteria staff during evening cleanup. Contains bank cards and student identification. Stored in Central Security Safe #3.',
    'Student Cafeteria',
    'Dining hall food court cleanup basket',
    '2026-11-09',
    'CLAIM_APPROVED',
    'Confirm the middle name or student ID number on the card inside.',
    'CAMPUS_SECURITY_DESK',
    'Campus Security Office, Admin Bldg Room 104',
    'https://images.unsplash.com/photo-1606503828343-4375b48bcabf?w=800&auto=format&fit=crop&q=80',
    'security.davis@campus.edu',
    '+1 (555) 911-4321',
    0
  );

  // Item 5: LOST AirPods Pro by Sarah
  insertItem.run(
    5,
    1,
    'LOST',
    'AirPods Pro (2nd Gen) in Matte Black Case',
    'Electronics',
    'White AirPods inside an aftermarket matte black silicone case with a small metal carabiner clip.',
    'Sports Complex / Gym',
    'Locker Room Bench Area near Locker #84',
    '2026-11-08',
    'REPORTED',
    null,
    'WITH_FINDER',
    'Sports Complex gym bench',
    'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80',
    'sarah.jenkins@campus.edu',
    '+1 (555) 234-8901',
    20
  );

  // Item 6: FOUND AirPods Pro (Matches Item 5!)
  insertItem.run(
    6,
    3,
    'FOUND',
    'AirPods Pro with Black Silicone Cover',
    'Electronics',
    'Found on the gym floor after basketball practice. Still has charge, Bluetooth shows name starting with "S".',
    'Sports Complex / Gym',
    'Indoor Basketball Court 1 side bleachers',
    '2026-11-08',
    'REPORTED',
    'What Bluetooth broadcast name appears when opening the case lid?',
    'WITH_FINDER',
    'Safely kept by Marcus Vance',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop&q=80',
    'marcus.vance@campus.edu',
    '+1 (555) 345-6789',
    0
  );

  // Item 7: FOUND Toyota Car Key
  insertItem.run(
    7,
    2,
    'FOUND',
    'Toyota Electronic Car Key on Blue Lanyard',
    'Keys & Wallets',
    'Black Toyota electronic key fob with two silver house keys attached to a blue university sports lanyard.',
    'Bus Stop / Campus Transit',
    'Main campus shuttle shelter bench',
    '2026-11-10',
    'REPORTED',
    'What miniature mascot charm is attached beside the house keys?',
    'CAMPUS_SECURITY_DESK',
    'Transit Security Booth #2',
    'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80',
    'alex.chen@campus.edu',
    '+1 (555) 876-5432',
    0
  );

  // Item 8: FOUND TI-84 Calculator
  insertItem.run(
    8,
    4,
    'FOUND',
    'Texas Instruments TI-84 Plus CE (Color Screen)',
    'Books & Stationery',
    'Mint condition graphing calculator with slide-on black cover. Found after Calculus III lecture.',
    'Science Complex / Labs',
    'Lecture Hall B, row 4 seat 12',
    '2026-11-07',
    'REPORTED',
    'What initial or initials are engraved or written inside the slide cover?',
    'STUDENT_UNION_OFFICE',
    'Student Union Lost & Found Cabinet, Desk #3',
    'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    'security.davis@campus.edu',
    '+1 (555) 911-4321',
    0
  );

  // Item 9: LOST Hydro Flask Water Bottle
  insertItem.run(
    9,
    2,
    'LOST',
    'Hydro Flask 32oz Wide Mouth (Pacific Blue)',
    'Personal Essentials',
    'Insulated bottle with slight dent on bottom rim. Decorated with Python, NASA, and Linux stickers.',
    'Main Library',
    'Ground floor collaborative study room C',
    '2026-11-06',
    'REPORTED',
    null,
    'WITH_FINDER',
    'Study room desk',
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    'alex.chen@campus.edu',
    '+1 (555) 876-5432',
    10
  );

  // Item 10: RETURNED North Face Jacket (Example of completed resolution!)
  insertItem.run(
    10,
    3,
    'LOST',
    'North Face Apex Bionic Softshell Jacket (Navy, Size L)',
    'Clothing & Accessories',
    'Navy blue softshell jacket left on coat rack during guest seminar.',
    'Auditorium & Arts',
    'Main Auditorium foyer coat check',
    '2026-11-03',
    'RETURNED',
    null,
    'RETURNED',
    'Successfully returned to Marcus Vance via Security Office verification',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
    'marcus.vance@campus.edu',
    '+1 (555) 345-6789',
    0
  );

  // 3. Insert Claims
  const insertClaim = db.prepare(`
    INSERT INTO claims (id, item_id, claimant_id, verification_answer, proof_description, status, review_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Sarah claimed Item 2 (Found MacBook)
  insertClaim.run(
    1,
    2,
    1,
    'The sticker on top is a GitHub Octocat holographic sticker, and the sleeve brand is Tomtoc with orange interior lining.',
    'I have the original Apple purchase invoice matching serial number C02G90J... and can unlock the laptop with my TouchID or password.',
    'PENDING',
    'Under review by finder Alex Chen. Verification details appear authentic.'
  );

  // Marcus claimed Item 4 (Found Wallet)
  insertClaim.run(
    2,
    4,
    3,
    'Student ID number is STU-2024-8831 and middle initial is E. Driver license is issued in Massachusetts.',
    'Matches physical driver license presented at security desk.',
    'APPROVED',
    'Approved by Officer Davis. Claimant can pick up at Central Security Office with photo ID.'
  );

  // 4. Activity Logs
  const insertLog = db.prepare(`
    INSERT INTO activity_logs (user_id, action, details)
    VALUES (?, ?, ?)
  `);

  insertLog.run(1, 'REPORT_LOST', 'Sarah Jenkins reported lost item: Apple MacBook Pro 14"');
  insertLog.run(2, 'REPORT_FOUND', 'Alex Chen reported found item: Apple Space Gray Laptop');
  insertLog.run(1, 'SUBMIT_CLAIM', 'Sarah Jenkins submitted claim verification for item #2');
  insertLog.run(4, 'CLAIM_APPROVED', 'Officer Davis approved claim #2 for Marcus Vance wallet');
  insertLog.run(4, 'ITEM_RETURNED', 'Officer Davis logged safe return of North Face Jacket #10');

  console.log('[Database] Seed completed successfully!');
}

module.exports = { seedDatabase };
