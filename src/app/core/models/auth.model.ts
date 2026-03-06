/**
 * Wrapper genérico para respostas da API, com status, erros e resultados
 * Usado para padronizar o tratamento de respostas em toda a aplicação
 */
export interface APIResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  errors?: any[];
  results?: T;
}

/**
 * DTO para requisição de login
 * Espelha o LoginRequestDTO do backend Spring Boot
 */
export interface LoginRequestDTO {
  email: string;
  password: string;
}

/**
 * DTO para requisição de registro
 * Espelha o RegisterRequestDTO do backend Spring Boot
 */
export interface RegisterRequestDTO {
  name: string;
  email: string;
  password: string;
}

/**
 * DTO para resposta de autenticação com token JWT
 * Espelha o AuthToken do backend Spring Boot
 */
export interface AuthToken {
  token: string;
}
