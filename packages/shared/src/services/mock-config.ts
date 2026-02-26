type MockTarget = "fs" | "audio" | "persistence";

interface MockConfig {
  isMockEnabled(target: MockTarget): boolean;
}

function parseMockConfig(): MockConfig {
  const params = new URLSearchParams(window.location.search);
  const mockParam = params.get("mock");
  if (mockParam == null) {
    return { isMockEnabled: () => false };
  }
  if (mockParam === "all") {
    return { isMockEnabled: () => true };
  }
  const targets = mockParam.split(",") as Array<MockTarget>;
  return {
    isMockEnabled: (target: MockTarget) => targets.includes(target),
  };
}

export const mockConfig: MockConfig = parseMockConfig();
