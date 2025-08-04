// types.ts
export interface DocumentationComponentProps {
  solution: {
    title: string;
    slug: string;
    icon: React.ComponentType<any>;
    gradient: string;
    apiEndpoint?: string;
  };
}

export type ApiConfig = {
  endpoint: string;
  requestBody: any;
  description: string;
};