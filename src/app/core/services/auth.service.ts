import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map } from 'rxjs';
import { environment } from '../../../enviroments/environment.development';
import { LoginRequestDTO, RegisterRequestDTO, AuthToken, APIResponse } from '../models/auth.model';

/**
 * Serviço de autenticação usando Signals para gerenciar o estado
 * Sem construtor - usa inject() direto nos campos
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal privado para o token de autenticação
  private authTokenSignal = signal<AuthToken | null>(null);

  // Signal público computado para verificar se está autenticado
  isAuthenticated = computed(() => this.authTokenSignal() !== null);

  constructor() {
    // Carrega o token do localStorage na inicialização
    this.loadTokenFromStorage();
  }

  /**
   * Realiza o login do usuário
   * Armazena o token no localStorage e atualiza o signal
   */
  login(credentials: LoginRequestDTO): Observable<AuthToken> {
    return this.http.post<APIResponse<AuthToken>>(`${this.apiUrl}/login`, credentials).pipe(
        map(response => response.results!), // Extrai o AuthToken do resultado da API
        tap(authToken => this.setAuthToken(authToken))
    );
  }

  /**
   * Registra um novo usuário e faz login automaticamente
   * Conforme regra de negócio: encadeia o login após registro bem-sucedido
   */
    register(userData: RegisterRequestDTO): Observable<AuthToken> {
        // Como o seu AuthFacade já faz o login e retorna o token, não precisamos de switchMap
        return this.http.post<APIResponse<AuthToken>>(`${this.apiUrl}/register`, userData).pipe(
        map(response => response.results!),
        tap(authToken => this.setAuthToken(authToken))
        );
    }

  /**
   * Realiza o logout do usuário
   * Remove o token do localStorage e limpa o signal
   */
  logout(): void {
    localStorage.removeItem('jwt_token');
    this.authTokenSignal.set(null);
  }

  /**
   * Armazena o token de autenticação no localStorage e atualiza o signal
   */
  private setAuthToken(authToken: AuthToken): void {
    localStorage.setItem('jwt_token', authToken.token);
    this.authTokenSignal.set(authToken);
  }

  /**
   * Carrega o token do localStorage na inicialização
   * Nota: Em um cenário real, seria ideal validar o token com o backend
   */
  private loadTokenFromStorage(): void {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      // TODO: Validar o token com o backend ou decodificar o JWT para obter o username
      // Por ora, cria um AuthToken parcial apenas com o token
      this.authTokenSignal.set({ token });
    }
  }
}
