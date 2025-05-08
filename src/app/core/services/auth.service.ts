import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());
    public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

    private apiUrl = 'http://localhost:8080';

    constructor(private http: HttpClient) { }

    private hasToken(): boolean {
        return !!localStorage.getItem('authToken');
    }

    private setCookie(name: string, value: string, days: number): void {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value}; ${expires}; path=/`;
    }

    public getCookie(name: string): string | null {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    private deleteCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }

    login(username: string, password: string): Observable<any> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const body = { username, password };

        return this.http.post<any>(`${this.apiUrl}/api/auth/login`, body, { headers }).pipe(
            tap(response => {
                const token = response.token;
                this.setCookie('authToken', token, 7);
                this.isAuthenticatedSubject.next(true);
            })
        );
    }

    register(username: string, password: string): Observable<any> {
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const body = { username, password };

        return this.http.post<any>(`${this.apiUrl}/api/auth/register`, body, { headers}).pipe(
            tap( response => {
                const token = response.token;
                this.setCookie('authToken', token, 7);
                this.isAuthenticatedSubject.next(true);
            })
        );
    }

    logout(): void {
        this.deleteCookie('authToken');
        this.isAuthenticatedSubject.next(false);
    }
}
