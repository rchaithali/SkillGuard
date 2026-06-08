// V1 base software engineering skill dictionary.
// This is not meant to contain every skill in the world.
// It gives SkillGuard a reliable base set of skills for common software roles.
// Role-specific scoring will happen separately through roleSkillMap.ts.

export type SkillCategory =
  | "language"
  | "frontend"
  | "backend"
  | "database"
  | "auth"
  | "testing"
  | "devops"
  | "cloud"
  | "tools"
  | "dsa"
  | "system"
  | "ai_ml"
  | "mobile";

export type SkillDefinition = {
  name: string;
  category: SkillCategory;
  aliases: string[];
};

export const skillDictionary: SkillDefinition[] = [
  // Languages
  { name: "JavaScript", category: "language", aliases: ["javascript", "js", "es6", "ecmascript"] },
  { name: "TypeScript", category: "language", aliases: ["typescript", "ts"] },
  { name: "C++", category: "language", aliases: ["c++", "cpp"] },
  { name: "Java", category: "language", aliases: ["java"] },
  { name: "Python", category: "language", aliases: ["python", "py"] },
  { name: "C", category: "language", aliases: ["c programming", "c language"] },
  { name: "Go", category: "language", aliases: ["go", "golang"] },
  { name: "C#", category: "language", aliases: ["c#", "c sharp", "csharp"] },

  // Frontend
  { name: "HTML", category: "frontend", aliases: ["html", "html5"] },
  { name: "CSS", category: "frontend", aliases: ["css", "css3"] },
  { name: "React", category: "frontend", aliases: ["react", "react.js", "reactjs"] },
  { name: "Next.js", category: "frontend", aliases: ["next", "next.js", "nextjs"] },
  { name: "Angular", category: "frontend", aliases: ["angular", "angularjs"] },
  { name: "Vue.js", category: "frontend", aliases: ["vue", "vue.js", "vuejs"] },
  { name: "Redux", category: "frontend", aliases: ["redux", "redux toolkit", "rtk"] },
  { name: "Tailwind CSS", category: "frontend", aliases: ["tailwind", "tailwind css", "tailwindcss"] },
  { name: "Bootstrap", category: "frontend", aliases: ["bootstrap"] },
  { name: "Responsive Design", category: "frontend", aliases: ["responsive design", "mobile responsive", "responsive ui"] },
  { name: "State Management", category: "frontend", aliases: ["state management", "hooks", "react hooks", "context api"] },

  // Backend
  { name: "Node.js", category: "backend", aliases: ["node", "node.js", "nodejs"] },
  { name: "Express.js", category: "backend", aliases: ["express", "express.js", "expressjs"] },
  { name: "NestJS", category: "backend", aliases: ["nestjs", "nest.js"] },
  { name: "Spring Boot", category: "backend", aliases: ["spring boot", "springboot"] },
  { name: "Django", category: "backend", aliases: ["django"] },
  { name: "Flask", category: "backend", aliases: ["flask"] },
  { name: "FastAPI", category: "backend", aliases: ["fastapi", "fast api"] },
  { name: "REST API", category: "backend", aliases: ["rest", "rest api", "restful api", "restful apis", "api development"] },
  { name: "GraphQL", category: "backend", aliases: ["graphql", "graph ql"] },
  { name: "Microservices", category: "backend", aliases: ["microservices", "microservice architecture"] },
  { name: "Middleware", category: "backend", aliases: ["middleware", "express middleware"] },
  { name: "API Integration", category: "backend", aliases: ["api integration", "third-party api", "third party api"] },

  // Databases
  { name: "MongoDB", category: "database", aliases: ["mongodb", "mongo db", "mongo"] },
  { name: "Mongoose", category: "database", aliases: ["mongoose", "mongoose odm"] },
  { name: "SQL", category: "database", aliases: ["sql", "structured query language"] },
  { name: "MySQL", category: "database", aliases: ["mysql", "my sql"] },
  { name: "PostgreSQL", category: "database", aliases: ["postgresql", "postgres", "postgre sql"] },
  { name: "Redis", category: "database", aliases: ["redis", "cache", "caching"] },
  { name: "Firebase", category: "database", aliases: ["firebase", "firestore"] },

  // Auth / Security
  { name: "JWT", category: "auth", aliases: ["jwt", "json web token", "json web tokens"] },
  { name: "Bcrypt", category: "auth", aliases: ["bcrypt", "password hashing", "hashed passwords"] },
  { name: "Authentication", category: "auth", aliases: ["authentication", "auth", "login system", "user login"] },
  { name: "Authorization", category: "auth", aliases: ["authorization", "role based access", "rbac", "access control"] },
  { name: "OAuth", category: "auth", aliases: ["oauth", "oauth2", "google login", "social login"] },

  // Testing
  { name: "Unit Testing", category: "testing", aliases: ["unit testing", "unit tests"] },
  { name: "Integration Testing", category: "testing", aliases: ["integration testing", "integration tests"] },
  { name: "Jest", category: "testing", aliases: ["jest"] },
  { name: "React Testing Library", category: "testing", aliases: ["react testing library", "rtl"] },
  { name: "API Testing", category: "testing", aliases: ["api testing", "postman testing"] },
  { name: "Cypress", category: "testing", aliases: ["cypress"] },

  // DevOps / Cloud
  { name: "Docker", category: "devops", aliases: ["docker", "containerization", "containers"] },
  { name: "Kubernetes", category: "devops", aliases: ["kubernetes", "k8s"] },
  { name: "CI/CD", category: "devops", aliases: ["ci/cd", "ci cd", "continuous integration", "continuous deployment"] },
  { name: "AWS", category: "cloud", aliases: ["aws", "amazon web services"] },
  { name: "Azure", category: "cloud", aliases: ["azure", "microsoft azure"] },
  { name: "GCP", category: "cloud", aliases: ["gcp", "google cloud", "google cloud platform"] },
  { name: "Vercel", category: "cloud", aliases: ["vercel"] },
  { name: "Netlify", category: "cloud", aliases: ["netlify"] },
  { name: "Render", category: "cloud", aliases: ["render", "render deployment"] },

  // Tools
  { name: "Git", category: "tools", aliases: ["git", "version control"] },
  { name: "GitHub", category: "tools", aliases: ["github", "git hub"] },
  { name: "GitLab", category: "tools", aliases: ["gitlab", "git lab"] },
  { name: "Postman", category: "tools", aliases: ["postman"] },
  { name: "Jira", category: "tools", aliases: ["jira", "atlassian jira"] },
  { name: "NPM", category: "tools", aliases: ["npm", "node package manager"] },
  { name: "Webpack", category: "tools", aliases: ["webpack"] },
  { name: "Vite", category: "tools", aliases: ["vite"] },

  // DSA / CS Fundamentals
  { name: "DSA", category: "dsa", aliases: ["dsa", "data structures", "algorithms", "data structures and algorithms"] },
  { name: "Arrays", category: "dsa", aliases: ["arrays", "array"] },
  { name: "Strings", category: "dsa", aliases: ["strings", "string"] },
  { name: "Hashing", category: "dsa", aliases: ["hashing", "hash map", "hashmap", "hash table"] },
  { name: "Linked List", category: "dsa", aliases: ["linked list", "linked lists"] },
  { name: "Stack", category: "dsa", aliases: ["stack", "stacks"] },
  { name: "Queue", category: "dsa", aliases: ["queue", "queues"] },
  { name: "Trees", category: "dsa", aliases: ["tree", "trees", "binary tree", "bst", "binary search tree"] },
  { name: "Graphs", category: "dsa", aliases: ["graph", "graphs", "graph theory"] },
  { name: "Dynamic Programming", category: "dsa", aliases: ["dynamic programming", "dp"] },
  { name: "Sliding Window", category: "dsa", aliases: ["sliding window"] },
  { name: "Two Pointers", category: "dsa", aliases: ["two pointers", "two pointer"] },
  { name: "Recursion", category: "dsa", aliases: ["recursion", "recursive"] },
  { name: "Time Complexity", category: "dsa", aliases: ["time complexity", "big o", "big-o", "space complexity"] },

  // System Design
  { name: "System Design", category: "system", aliases: ["system design", "scalable design", "system architecture"] },
  { name: "Scalability", category: "system", aliases: ["scalability", "scalable", "scaled"] },
  { name: "Caching", category: "system", aliases: ["caching", "cache layer", "cache"] },
  { name: "Load Balancing", category: "system", aliases: ["load balancing", "load balancer"] },
  { name: "Message Queues", category: "system", aliases: ["message queue", "message queues", "rabbitmq", "kafka"] },

  // AI / ML basics
  { name: "Machine Learning", category: "ai_ml", aliases: ["machine learning", "ml"] },
  { name: "Deep Learning", category: "ai_ml", aliases: ["deep learning", "dl"] },
  { name: "NLP", category: "ai_ml", aliases: ["nlp", "natural language processing"] },
  { name: "LLM", category: "ai_ml", aliases: ["llm", "large language model", "large language models"] },

  // Mobile basics
  { name: "React Native", category: "mobile", aliases: ["react native", "react-native"] },
  { name: "Android", category: "mobile", aliases: ["android", "android development"] },
  { name: "iOS", category: "mobile", aliases: ["ios", "ios development"] },
  { name: "Flutter", category: "mobile", aliases: ["flutter", "dart"] }
];