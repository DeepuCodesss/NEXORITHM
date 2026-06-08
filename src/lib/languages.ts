export const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "python", label: "Python 3", monaco: "python" },
  { id: "cpp", label: "C++ 20", monaco: "cpp" },
  { id: "c", label: "C", monaco: "c" },
  { id: "java", label: "Java 21", monaco: "java" },
  { id: "go", label: "Go", monaco: "go" },
  { id: "rust", label: "Rust", monaco: "rust" },
  { id: "php", label: "PHP", monaco: "php" },
  { id: "ruby", label: "Ruby", monaco: "ruby" },
] as const;

export type JudgeLanguage = (typeof SUPPORTED_LANGUAGES)[number]["id"];

export const isJudgeLanguage = (value: unknown): value is JudgeLanguage =>
  typeof value === "string" && SUPPORTED_LANGUAGES.some((language) => language.id === value);

export const languageById = (id: JudgeLanguage) =>
  SUPPORTED_LANGUAGES.find((language) => language.id === id) ?? SUPPORTED_LANGUAGES[0];
