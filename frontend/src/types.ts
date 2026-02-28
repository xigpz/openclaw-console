// 平台配置
export interface Platform {
  id?: number;
  name: string;
  enabled: boolean;
  config?: string;
}

// 模型配置
export interface Model {
  id: string;
  name: string;
  provider: string;
  api_key?: string;
  base_url?: string;
  model_id?: string;
  enabled: boolean;
}

// Skill
export interface Skill {
  id: number;
  name: string;
  source?: string;
  spec?: string;
  version?: string;
  installed: boolean;
  enabled: boolean;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
