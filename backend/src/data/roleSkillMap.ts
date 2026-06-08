// Role-specific skill expectations for SkillGuard V1.
// This file tells the scoring engine which skills matter for each role.
// Skill names should match names from skillDictionary.ts as much as possible.

export type RoleName =
  | "Frontend Developer"
  | "Backend Developer"
  | "Full Stack Developer"
  | "MERN Stack Developer"
  | "Software Engineer"
  | "AI/ML Engineer"
  | "Mobile Developer";

export type RoleSkillConfig = {
  role: RoleName;
  coreSkills: string[];
  secondarySkills: string[];
  dsaExpected: boolean;
};

export const roleSkillMap: RoleSkillConfig[] = [
  {
    role: "Frontend Developer",
    coreSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Responsive Design",
      "API Integration"
    ],
    secondarySkills: [
      "TypeScript",
      "Tailwind CSS",
      "Redux",
      "Next.js",
      "State Management",
      "Git",
      "GitHub",
      "Jest",
      "React Testing Library"
    ],
    dsaExpected: true
  },
  {
    role: "Backend Developer",
    coreSkills: [
      "Node.js",
      "Express.js",
      "REST API",
      "MongoDB",
      "SQL",
      "Authentication",
      "Authorization"
    ],
    secondarySkills: [
      "TypeScript",
      "PostgreSQL",
      "Redis",
      "JWT",
      "Bcrypt",
      "Docker",
      "System Design",
      "API Testing",
      "Microservices"
    ],
    dsaExpected: true
  },
  {
    role: "Full Stack Developer",
    coreSkills: [
      "React",
      "JavaScript",
      "Node.js",
      "Express.js",
      "REST API",
      "MongoDB"
    ],
    secondarySkills: [
      "TypeScript",
      "SQL",
      "Tailwind CSS",
      "JWT",
      "Authentication",
      "Git",
      "GitHub",
      "Responsive Design",
      "API Testing",
      "System Design"
    ],
    dsaExpected: true
  },
  {
    role: "MERN Stack Developer",
    coreSkills: [
      "MongoDB",
      "Express.js",
      "React",
      "Node.js",
      "REST API"
    ],
    secondarySkills: [
      "JavaScript",
      "TypeScript",
      "JWT",
      "Bcrypt",
      "Tailwind CSS",
      "Git",
      "GitHub",
      "API Testing"
    ],
    dsaExpected: true
  },
  {
    role: "Software Engineer",
    coreSkills: [
      "JavaScript",
      "REST API",
      "Git",
      "DSA",
      "Time Complexity"
    ],
    secondarySkills: [
      "TypeScript",
      "Node.js",
      "React",
      "MongoDB",
      "SQL",
      "System Design",
      "Unit Testing",
      "Docker",
      "AWS"
    ],
    dsaExpected: true
  },
  {
    role: "AI/ML Engineer",
    coreSkills: [
      "Python",
      "Machine Learning",
      "DSA",
      "Time Complexity"
    ],
    secondarySkills: [
      "NLP",
      "Deep Learning",
      "LLM",
      "SQL",
      "Git",
      "API Integration",
      "Docker"
    ],
    dsaExpected: true
  },
  {
    role: "Mobile Developer",
    coreSkills: [
      "React Native",
      "Android",
      "iOS",
      "API Integration"
    ],
    secondarySkills: [
      "JavaScript",
      "TypeScript",
      "Flutter",
      "Firebase",
      "Git",
      "GitHub",
      "Authentication"
    ],
    dsaExpected: true
  }
];