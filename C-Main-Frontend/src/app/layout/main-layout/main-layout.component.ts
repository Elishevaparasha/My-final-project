import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit {
  readonly searchControl = new FormControl('', { nonNullable: true });

  constructor(
    readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.syncSearchFromRoute());
    this.syncSearchFromRoute();
  }

  private syncSearchFromRoute(): void {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    const q = route.snapshot.queryParamMap.get('q') ?? '';
    if (this.searchControl.value !== q) {
      this.searchControl.setValue(q, { emitEvent: false });
    }
  }

  onSearch(): void {
    const q = this.searchControl.value.trim();
    this.router.navigate(['/videos'], { queryParams: q ? { q } : {} });
  }

  logout(): void {
    this.auth.logout();
  }
}
