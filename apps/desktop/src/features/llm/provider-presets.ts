export interface ProviderPreset {
  id: string;
  label: string;
  baseUrl: string;
  modelHint: string;
  models: string[];
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "zhipu",
    label: "智谱 AI",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    modelHint: "glm-4.5",
    models: ["glm-4.5", "glm-4.5-air", "glm-4.5-x"],
  },
  {
    id: "kimi",
    label: "Kimi",
    baseUrl: "https://api.moonshot.cn/v1/chat/completions",
    modelHint: "moonshot-v1-8k",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
  },
  {
    id: "qwen",
    label: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelHint: "qwen-plus",
    models: ["qwen-plus", "qwen-turbo", "qwen-max"],
  },
  {
    id: "ernie",
    label: "文心一言",
    baseUrl: "https://qianfan.baidubce.com/v2/chat/completions",
    modelHint: "ernie-4.0-turbo-8k",
    models: ["ernie-4.0-turbo-8k", "ernie-4.0-8k-latest"],
  },
  {
    id: "doubao",
    label: "豆包",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    modelHint: "doubao-seed-1-6-250615",
    models: ["doubao-seed-1-6-250615", "doubao-pro-32k", "doubao-lite-4k"],
  },
];

export function modelsForProvider(providerName: string) {
  const matched = PROVIDER_PRESETS.find(
    (item) => item.label === providerName || item.id === providerName,
  );
  return matched?.models ?? [];
}
