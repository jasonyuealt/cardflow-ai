/**
 * API 相关类型定义
 */

// HTTP 方法
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API 参数定义
export class ApiParameter {
  type: string;
  required: boolean;
  description: string;
  default?: any;

  constructor(
    type: string,
    required: boolean = false,
    description: string = '',
    defaultValue?: any
  ) {
    this.type = type;
    this.required = required;
    this.description = description;
    if (defaultValue !== undefined) {
      this.default = defaultValue;
    }
  }
}

// API 定义
export class ApiDefinition {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  method: HttpMethod;
  parameters: Record<string, ApiParameter>;
  returnType: string;
  mockDataFile?: string;

  constructor(
    id: string,
    name: string,
    description: string,
    endpoint: string,
    method: HttpMethod = 'POST',
    parameters: Record<string, ApiParameter> = {},
    returnType: string = 'any',
    mockDataFile?: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.endpoint = endpoint;
    this.method = method;
    this.parameters = parameters;
    this.returnType = returnType;
    this.mockDataFile = mockDataFile;
  }
}

// API 调用配置
export class ApiCallConfig {
  apiId: string;
  endpoint: string;
  method: HttpMethod;
  parameters: Record<string, any>;
  parameterTemplate?: Record<string, any>;

  constructor(
    apiId: string,
    endpoint: string,
    method: HttpMethod,
    parameters: Record<string, any> = {},
    parameterTemplate?: Record<string, any>
  ) {
    this.apiId = apiId;
    this.endpoint = endpoint;
    this.method = method;
    this.parameters = parameters;
    this.parameterTemplate = parameterTemplate;
  }
}

// API 响应
export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;

  constructor(success: boolean, data?: T, error?: string, statusCode?: number) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.statusCode = statusCode;
  }

  static success<T>(data: T): ApiResponse<T> {
    return new ApiResponse(true, data);
  }

  static error(error: string, statusCode: number = 500): ApiResponse {
    return new ApiResponse(false, undefined, error, statusCode);
  }
}

