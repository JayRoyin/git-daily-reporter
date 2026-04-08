export interface ProviderPreset {
  id: string;
  label: string;
  baseUrl: string;
  modelHint: string;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: "zhipu",
    label: "智谱 AI",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    modelHint: "glm-4.5",
  },
  {
    id: "kimi",
    label: "Kimi",
    baseUrl: "https://api.moonshot.cn/v1/chat/completions",
    modelHint: "moonshot-v1-8k",
  },
  {
    id: "qwen",
    label: "通义千问",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
    modelHint: "qwen-plus",
  },
  {
    id: "ernie",
    label: "文心一言",
    baseUrl: "https://qianfan.baidubce.com/v2/chat/completions",
    modelHint: "ernie-4.0-turbo-8k",
  },
  {
    id: "doubao",
    label: "豆包",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    modelHint: "doubao-seed-1-6-250615",
  },
];
