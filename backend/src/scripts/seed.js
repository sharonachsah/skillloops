// backend/src/scripts/seed.js
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../db.js";
import User from "../models/User.js";
import Lesson from "../models/Lesson.js";
import Challenge from "../models/Challenge.js";
import Course from "../models/Course.js";
import Room from "../models/Room.js";
import mongoose from "mongoose";

/**
 * Realistic seed data for SkillLoops:
 * - 15 users (names/emails)
 * - 15 lessons (clear topic + small snippet)
 * - 15 challenges (mix of MCQ + coding stubs)
 * - 15 courses (each aggregates lessons + challenges)
 * - 15 rooms (each references a challenge)
 */

function makeUsers() {
  const names = ["alice","bob","carol","dave","eve","frank","grace","heidi","ivan","judy","ken","laura","mallory","niaj","olivia"];
  return names.map((n, i) => ({
    uid: `seed-uid-${i+1}`,
    email: `${n}@example.com`,
    roles: (i % 5 === 0) ? ["creator","learner"] : ["learner"],
    avatar: `https://i.pravatar.cc/150?img=${10 + i}`,
    skills: i % 3 === 0 ? ["javascript","react"] : (i % 3 === 1 ? ["python","algorithms"] : ["git","devops"]),
    xp: Math.floor(Math.random() * 1200)
  }));
}

function makeLessons() {
  return [
    {
      title: "JavaScript — Variables & Types",
      content: "let, const, var — primitives vs objects. Examples: strings, numbers, booleans.",
      code: `// variables example\nconst name = "Alice"; let x = 10;`
    },
    {
      title: "JavaScript — Functions & Arrow Syntax",
      content: "Function declarations, arrow functions, 'this' differences.",
      code: `const add = (a,b) => a+b;`
    },
    {
      title: "React — Components & Props",
      content: "Functional components, props, basic composition.",
      code: `function Greeting({name}){ return <div>Hello {name}</div> }`
    },
    {
      title: "React — State & Hooks",
      content: "useState, useEffect basics.",
      code: `const [count, setCount] = useState(0);`
    },
    {
      title: "Node.js — Modules & HTTP",
      content: "CommonJS vs ESM, create a simple HTTP server using Express.",
      code: `import express from "express"; const app = express();`
    },
    {
      title: "MongoDB — Basics & Mongoose",
      content: "Documents, collections, simple Mongoose schema and queries.",
      code: `const user = await User.findOne({email:"alice@example.com"})`
    },
    {
      title: "CSS — Flexbox",
      content: "Layout with flex containers and common patterns.",
      code: `.container { display: flex; align-items: center; }`
    },
    {
      title: "Git — Branching & PRs",
      content: "Feature branches, rebasing vs merging, opening a pull request."
    },
    {
      title: "HTTP — Status Codes",
      content: "200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error."
    },
    {
      title: "Algorithms — Big O Intro",
      content: "Time complexity basics: O(1), O(n), O(n log n)."
    },
    {
      title: "Data Structures — Arrays & Maps",
      content: "When to use arrays vs maps, basic operations and complexity."
    },
    {
      title: "SQL — SELECT & JOIN",
      content: "Select data and join tables with examples."
    },
    {
      title: "Testing — Unit Tests with Jest",
      content: "Write small unit tests with Jest and run them via npm test."
    },
    {
      title: "Docker — Containers Intro",
      content: "Dockerfile basics and running a container."
    },
    {
      title: "Security — OWASP Basics",
      content: "Input validation, XSS, CSRF, secure headers."
    }
  ];
}

function makeChallenges() {
  // A mix: MCQs and coding stubs
  return [
    {
      title: "JS: Which is a primitive type?",
      description: "Pick the primitive type from the list.",
      questionType: "mcq",
      options: ["Object", "Array", "String", "Function"],
      answerIndex: 2,
      timeLimit: 20,
      tags: ["javascript","basics"]
    },
    {
      title: "React: Key prop purpose",
      description: "Why do we provide `key` to list items in React?",
      questionType: "mcq",
      options: ["Performance hint", "Unique identity for elements", "Access DOM nodes", "Style elements"],
      answerIndex: 1,
      timeLimit: 25,
      tags: ["react"]
    },
    {
      title: "Node: How to send JSON from Express?",
      description: "Select the correct method.",
      questionType: "mcq",
      options: ["res.sendJSON()", "res.json()", "res.writeJSON()", "res.body()"],
      answerIndex: 1,
      timeLimit: 15,
      tags: ["node","express"]
    },
    {
      title: "MongoDB: What is a document?",
      description: "Choose the best description.",
      questionType: "mcq",
      options: ["Table row", "JSON-like object", "SQL query", "Server process"],
      answerIndex: 1,
      timeLimit: 20,
      tags: ["mongodb"]
    },
    {
      title: "Algorithms: Binary search complexity",
      description: "What's time complexity of binary search on sorted array?",
      questionType: "mcq",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      answerIndex: 1,
      timeLimit: 15,
      tags: ["algorithms"]
    },
    {
      title: "Coding: Reverse a string (starter)",
      description: "Return reversed string. Implement function `reverseStr(s)`.",
      questionType: "coding",
      starterCode: `function reverseStr(s){\n  // implement\n}\nmodule.exports = reverseStr;`,
      tests: ["reverseStr('abc') === 'cba'","reverseStr('') === ''"],
      timeLimit: 120,
      tags: ["coding","strings"]
    },
    {
      title: "Coding: Sum of array (starter)",
      description: "Return sum of numeric array. Implement `sum(arr)`.",
      questionType: "coding",
      starterCode: `function sum(arr){\n  // implement\n}\nmodule.exports = sum;`,
      tests: ["sum([1,2,3]) === 6","sum([]) === 0"],
      timeLimit: 120,
      tags: ["coding","arrays"]
    },
    {
      title: "HTTP: Status 404 means?",
      description: "What does 404 indicate?",
      questionType: "mcq",
      options: ["Server error", "Resource not found", "Unauthorized", "Bad request"],
      answerIndex: 1,
      timeLimit: 10,
      tags: ["http"]
    },
    {
      title: "CSS: Flex direction default",
      description: "What's default `flex-direction`?",
      questionType: "mcq",
      options: ["row", "column", "row-reverse", "column-reverse"],
      answerIndex: 0,
      timeLimit: 10,
      tags: ["css","layout"]
    },
    {
      title: "SQL: JOIN returns?",
      description: "What does INNER JOIN return?",
      questionType: "mcq",
      options: ["All rows from left table", "All rows from right table", "Rows matching join condition", "No rows"],
      answerIndex: 2,
      timeLimit: 20,
      tags: ["sql"]
    },
    {
      title: "Git: How to create branch?",
      description: "Command to create and checkout new branch `feature`?",
      questionType: "mcq",
      options: ["git create feature", "git branch feature", "git checkout -b feature", "git new feature"],
      answerIndex: 2,
      timeLimit: 15,
      tags: ["git"]
    },
    {
      title: "Docker: Purpose of Dockerfile",
      description: "What's a Dockerfile for?",
      questionType: "mcq",
      options: ["Runtime monitoring", "Define container build steps", "Start database", "Manage users"],
      answerIndex: 1,
      timeLimit: 15,
      tags: ["docker"]
    },
    {
      title: "Security: XSS stands for?",
      description: "Choose expansion.",
      questionType: "mcq",
      options: ["Cross-site scripting", "Cross-server sync", "Extra secure x", "Cross-site storage"],
      answerIndex: 0,
      timeLimit: 15,
      tags: ["security"]
    },
    {
      title: "Testing: What is unit test?",
      description: "Small focused test for a unit of code.",
      questionType: "mcq",
      options: ["Test whole system", "Test small piece", "UI test", "Performance test"],
      answerIndex: 1,
      timeLimit: 15,
      tags: ["testing"]
    },
    {
      title: "React: useEffect depends array",
      description: "Empty deps array runs effect when?",
      questionType: "mcq",
      options: ["Every render", "Never", "Only on mount", "Only on unmount"],
      answerIndex: 2,
      timeLimit: 20,
      tags: ["react","hooks"]
    }
  ];
}

function makeCourses(lessonsDocs, challengesDocs, users) {
  // meaningful micro-courses that group lessons + challenges
  const courseDefs = [
    { title: "JS Fundamentals", description: "Vars, functions, basics.", lessons: [0,1], challenges: [0] },
    { title: "React Basics", description: "Components & state.", lessons: [2,3], challenges: [1,14] },
    { title: "Node & Express", description: "Server fundamentals.", lessons: [4,5], challenges: [2] },
    { title: "Databases with MongoDB", description: "CRUD with Mongoose.", lessons: [5], challenges: [3] },
    { title: "CSS Layouts", description: "Flexbox & responsive patterns.", lessons: [6], challenges: [8] },
    { title: "Git & Collaboration", description: "Branching, PRs, workflows.", lessons: [7], challenges: [11] },
    { title: "HTTP Deep Dive", description: "Status codes & methods.", lessons: [8], challenges: [7] },
    { title: "Algorithms Intro", description: "Complexity & searching.", lessons: [9,10], challenges: [4] },
    { title: "SQL Essentials", description: "Selects and joins.", lessons: [11], challenges: [9] },
    { title: "Testing with Jest", description: "Unit tests", lessons: [12], challenges: [12] },
    { title: "Docker Basics", description: "Images & containers.", lessons: [13], challenges: [13] },
    { title: "Security Basics", description: "OWASP highlights.", lessons: [14], challenges: [14] },
    { title: "String & Array Recipes", description: "Small algorithms & patterns.", lessons: [0,10], challenges: [5,6] },
    { title: "Fullstack Micro-Course", description: "Quick path from front to backend.", lessons: [2,4,5], challenges: [1,2,3] },
    { title: "Interview Warmups", description: "Short MCQs & small coding tasks.", lessons: [9,12], challenges: [4,5,6] }
  ];

  return courseDefs.map((cdef, i) => {
    const lessonSnapshots = cdef.lessons.map(idx => {
      const l = lessonsDocs[idx];
      return {
        lessonId: l._id,
        title: l.title,
        content: l.content,
        videoUrl: l.videoUrl || "",
        code: l.code || "",
        createdBy: users[i % users.length].uid
      };
    });
    const challengeRefs = cdef.challenges.map(idx => challengesDocs[idx]._id);
    return {
      title: cdef.title,
      description: cdef.description,
      creatorUid: users[i % users.length].uid,
      tags: ["micro-course", cdef.title.split(" ")[0].toLowerCase()],
      lessons: lessonSnapshots,
      challenges: challengeRefs,
      published: true
    };
  });
}

async function seed() {
  await connectDB();

  // drop text indexes to avoid array conflicts
  try { await Challenge.collection.dropIndexes(); } catch(e){/*ignore*/ }
  try { await Course.collection.dropIndexes(); } catch(e){/*ignore*/ }

  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Lesson.deleteMany({}),
    Challenge.deleteMany({}),
    Course.deleteMany({}),
    Room.deleteMany({})
  ]);

  // USERS
  console.log("Seeding users...");
  const usersData = makeUsers();
  const createdUsers = await User.insertMany(usersData);
  console.log("Inserted users:", createdUsers.length);

  // LESSONS
  console.log("Seeding lessons...");
  const lessonsData = makeLessons().map((l, idx) => ({ ...l, createdBy: createdUsers[idx % createdUsers.length].uid }));
  const createdLessons = await Lesson.insertMany(lessonsData);
  console.log("Inserted lessons:", createdLessons.length);

  // CHALLENGES
  console.log("Seeding challenges...");
  const challengesData = makeChallenges().map((c, idx) => ({ ...c, creatorUid: createdUsers[idx % createdUsers.length].uid }));
  const createdChallenges = await Challenge.insertMany(challengesData);
  console.log("Inserted challenges:", createdChallenges.length);

  // COURSES
  console.log("Seeding courses...");
  const coursesData = makeCourses(createdLessons, createdChallenges, createdUsers);
  const createdCourses = await Course.insertMany(coursesData);
  console.log("Inserted courses:", createdCourses.length);

  // ROOMS
  console.log("Seeding rooms...");
  const roomsData = createdCourses.map((course, i) => {
    const p1 = createdUsers[i % createdUsers.length];
    const p2 = createdUsers[(i + 1) % createdUsers.length];
    const ch = createdChallenges[i % createdChallenges.length]._id;
    return {
      code: (course.title.match(/\b\w/g) || []).slice(0,4).join("").toUpperCase() + (100 + i),
      mode: i % 3 === 0 ? "group" : "1v1",
      participants: [{ uid: p1.uid, displayName: p1.email }, { uid: p2.uid, displayName: p2.email }],
      scoreboard: [
        { name: p1.email, score: Math.floor(Math.random()*100) },
        { name: p2.email, score: Math.floor(Math.random()*100) }
      ],
      createdBy: p1.uid,
      challengeId: ch,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
    };
  });
  // ensure at least 15 rooms: duplicate variant if needed
  while (roomsData.length < 15) {
    const i = roomsData.length;
    const p1 = createdUsers[i % createdUsers.length];
    const p2 = createdUsers[(i + 2) % createdUsers.length];
    const ch = createdChallenges[(i+3) % createdChallenges.length]._id;
    roomsData.push({
      code: "R" + (200 + i),
      mode: "1v1",
      participants: [{ uid: p1.uid, displayName: p1.email }, { uid: p2.uid, displayName: p2.email }],
      scoreboard: [{ name: p1.email, score: 0 }, { name: p2.email, score: 0 }],
      createdBy: p1.uid,
      challengeId: ch,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    });
  }

  const createdRooms = await Room.insertMany(roomsData.slice(0,15));
  console.log("Inserted rooms:", createdRooms.length);

  console.log("Seeding finished successfully.");
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed", err);
  process.exit(1);
});
