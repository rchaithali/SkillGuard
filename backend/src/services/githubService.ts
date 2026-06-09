export type GitHubRepoSignal = {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  detectedStack: string[];
};

export type GitHubProjectSignals = {
  hasPublicProjects: boolean;
  hasRecentActivity: boolean;
  hasBackendSignals: boolean;
  hasFrontendSignals: boolean;
  hasDeploymentSignals: boolean;
  detectedGitHubStack: string[];
  strongRepositories: string[];
};

export type GitHubSignals = {
  username: string;
  publicRepos: number;
  followers: number;
  topLanguages: string[];
  repositories: GitHubRepoSignal[];
  githubProjectSignals: GitHubProjectSignals;
};

const hasKeyword = (text: string, keywords: string[]) => {
  const normalizedText = text.toLowerCase();

  return keywords.some((keyword) =>
    normalizedText.includes(keyword.toLowerCase())
  );
};

const isRecentlyUpdated = (updatedAt: string) => {
  const updatedDate = new Date(updatedAt);
  const now = new Date();

  const diffInMs = now.getTime() - updatedDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays <= 180;
};

const detectStackFromDependencies = (dependencies: Record<string, string>) => {
  const detectedStack = new Set<string>();

  const dependencyNames = Object.keys(dependencies);

  dependencyNames.forEach((dependency) => {
    const normalizedDependency = dependency.toLowerCase();

    if (normalizedDependency === "react") detectedStack.add("React");
    if (normalizedDependency === "vite") detectedStack.add("Vite");
    if (normalizedDependency === "tailwindcss") detectedStack.add("Tailwind CSS");

    if (normalizedDependency === "express") detectedStack.add("Express.js");
    if (normalizedDependency === "mongoose") detectedStack.add("MongoDB");
    if (normalizedDependency === "mongodb") detectedStack.add("MongoDB");

    if (normalizedDependency === "jsonwebtoken") detectedStack.add("JWT");
    if (normalizedDependency === "bcrypt") detectedStack.add("Bcrypt");
    if (normalizedDependency === "bcryptjs") detectedStack.add("Bcrypt");

    if (normalizedDependency === "cors") detectedStack.add("CORS");
    if (normalizedDependency === "dotenv") detectedStack.add("Dotenv");

    if (normalizedDependency === "typescript") detectedStack.add("TypeScript");
    if (normalizedDependency === "axios") detectedStack.add("Axios");

    if (normalizedDependency === "next") detectedStack.add("Next.js");
    if (normalizedDependency === "fastify") detectedStack.add("Fastify");
    if (normalizedDependency === "prisma") detectedStack.add("Prisma");
  });

  return [...detectedStack];
};

const fetchRepoPackageJsonStack = async (
  username: string,
  repoName: string
): Promise<string[]> => {
  const branchesToTry = ["main", "master"];
  const packageJsonPaths = [
    "package.json",
    "backend/package.json",
    "frontend/package.json"
  ];

  const detectedStack = new Set<string>();

  for (const branch of branchesToTry) {
    for (const packageJsonPath of packageJsonPaths) {
      try {
        const packageJsonResponse = await fetch(
          `https://raw.githubusercontent.com/${username}/${repoName}/${branch}/${packageJsonPath}`
        );

        if (!packageJsonResponse.ok) {
          continue;
        }

        const packageJson = await packageJsonResponse.json();

        const dependencies = {
          ...(packageJson.dependencies || {}),
          ...(packageJson.devDependencies || {})
        };

        const stackFromThisPackage = detectStackFromDependencies(dependencies);

        stackFromThisPackage.forEach((stack) => detectedStack.add(stack));
      } catch (error) {
        continue;
      }
    }

    // If we found stack in this branch, no need to try the next branch.
    if (detectedStack.size > 0) {
      break;
    }
  }

  return [...detectedStack];
};

const buildGitHubProjectSignals = (
  publicRepos: number,
  repositories: GitHubRepoSignal[]
): GitHubProjectSignals => {
  const backendKeywords = [
    "api",
    "backend",
    "server",
    "express",
    "node",
    "auth",
    "jwt",
    "mongodb",
    "postgres",
    "database"
  ];

  const frontendKeywords = [
    "frontend",
    "react",
    "vite",
    "ui",
    "dashboard",
    "tailwind",
    "component"
  ];

  const deploymentKeywords = [
    "deploy",
    "deployment",
    "vercel",
    "netlify",
    "render",
    "docker",
    "aws"
  ];

  const strongRepositories: string[] = [];
  const detectedGitHubStack = new Set<string>();

  let hasBackendSignals = false;
  let hasFrontendSignals = false;
  let hasDeploymentSignals = false;
  let hasRecentActivity = false;

  repositories.forEach((repo) => {
    const combinedRepoText = `${repo.name} ${repo.description || ""} ${
      repo.language || ""
    }`;

    repo.detectedStack.forEach((stack) => detectedGitHubStack.add(stack));

    if (isRecentlyUpdated(repo.updatedAt)) {
      hasRecentActivity = true;
    }

    const repoHasBackendSignal =
      hasKeyword(combinedRepoText, backendKeywords) ||
      repo.detectedStack.some((stack) =>
        ["Express.js", "MongoDB", "JWT", "Bcrypt", "Prisma", "Fastify"].includes(
          stack
        )
      );

    const repoHasFrontendSignal =
      hasKeyword(combinedRepoText, frontendKeywords) ||
      repo.detectedStack.some((stack) =>
        ["React", "Vite", "Tailwind CSS", "Next.js"].includes(stack)
      );

    const repoHasDeploymentSignal = hasKeyword(
      combinedRepoText,
      deploymentKeywords
    );

    if (repoHasBackendSignal) hasBackendSignals = true;
    if (repoHasFrontendSignal) hasFrontendSignals = true;
    if (repoHasDeploymentSignal) hasDeploymentSignals = true;

    const engineeringSignalCount = [
      repoHasBackendSignal,
      repoHasFrontendSignal,
      repoHasDeploymentSignal,
      repo.detectedStack.length > 0
    ].filter(Boolean).length;

    if (engineeringSignalCount >= 1 && isRecentlyUpdated(repo.updatedAt)) {
      strongRepositories.push(repo.name);
    }
  });

  return {
    hasPublicProjects: publicRepos > 0,
    hasRecentActivity,
    hasBackendSignals,
    hasFrontendSignals,
    hasDeploymentSignals,
    detectedGitHubStack: [...detectedGitHubStack],
    strongRepositories
  };
};

export const fetchGitHubSignals = async (
  githubUsername: string
): Promise<GitHubSignals | null> => {
  try {
    const profileResponse = await fetch(
      `https://api.github.com/users/${githubUsername}`
    );

    if (!profileResponse.ok) {
      return null;
    }

    const profileData = await profileResponse.json();

    const reposResponse = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=10`
    );

    if (!reposResponse.ok) {
      return null;
    }

    const reposData = await reposResponse.json();

    const repositories: GitHubRepoSignal[] = await Promise.all(
      reposData.map(async (repo: any) => {
        const detectedStack = await fetchRepoPackageJsonStack(
          githubUsername,
          repo.name
        );

        return {
          name: repo.name,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updatedAt: repo.updated_at,
          detectedStack
        };
      })
    );

    const languageCount = new Map<string, number>();

    repositories.forEach((repo) => {
      if (!repo.language) return;

      languageCount.set(
        repo.language,
        (languageCount.get(repo.language) || 0) + 1
      );
    });

    const topLanguages = [...languageCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([language]) => language);

    const githubProjectSignals = buildGitHubProjectSignals(
      profileData.public_repos,
      repositories
    );

    return {
      username: githubUsername,
      publicRepos: profileData.public_repos,
      followers: profileData.followers,
      topLanguages,
      repositories,
      githubProjectSignals
    };
  } catch (error) {
    return null;
  }
};