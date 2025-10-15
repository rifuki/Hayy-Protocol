// API client for StackLend backend
const API_BASE_URL = 'http://localhost:3001/api';

export interface Position {
  suiAddress: string;
  stxCollateral: number;
  sbtcCollateral: number;
  usdcBorrowed: number;
  isLiquidatable: boolean;
  borrowPower: number;
  objectId: string;
}

export interface LookupResponse {
  success: boolean;
  stacksAddress?: string;
  position?: Position;
  message?: string;
}

export interface SuggestResponse {
  success: boolean;
  message: string;
  currentAddress: string;
  position?: Position;
  suggestions?: Array<{
    stacksAddress: string;
    suiAddress: string;
    stxCollateral: number;
    borrowPower: number;
  }>;
}

export interface PositionsResponse {
  success: boolean;
  positions: Array<Position & { stacksAddress: string }>;
  total: number;
}

class StackLendAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async lookupByStacksAddress(stacksAddress: string): Promise<LookupResponse> {
    const response = await fetch(`${this.baseUrl}/lookup/${stacksAddress}`);
    return response.json();
  }

  async suggestForSuiAddress(suiAddress: string): Promise<SuggestResponse> {
    const response = await fetch(`${this.baseUrl}/suggest/${suiAddress}`);
    return response.json();
  }

  async getAllPositions(): Promise<PositionsResponse> {
    const response = await fetch(`${this.baseUrl}/positions`);
    return response.json();
  }

  async getPositionBySuiAddress(suiAddress: string): Promise<LookupResponse> {
    const response = await fetch(`${this.baseUrl}/position/${suiAddress}`);
    return response.json();
  }

  async getAddressMappings(): Promise<{ success: boolean; mappings: Record<string, string> }> {
    const response = await fetch(`${this.baseUrl}/mappings`);
    return response.json();
  }

  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }
}

export const stackLendAPI = new StackLendAPI();
export default stackLendAPI;