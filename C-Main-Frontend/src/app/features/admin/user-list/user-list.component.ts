import { Component, OnInit, signal } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { Role, UserResponse } from '../../../core/models/api.models';

@Component({
  selector: 'app-user-list',
  standalone: true,
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  readonly users = signal<UserResponse[]>([]);
  readonly error = signal<string | null>(null);
  readonly Role = Role;

  constructor(private readonly userService: UserService) {}

  ngOnInit(): void {
    this.userService.getAll().subscribe({
      next: (data) => this.users.set(data),
      error: () => this.error.set('שגיאה בטעינת משתמשים'),
    });
  }

  roleLabel(role: Role): string {
    switch (role) {
      case Role.Admin:
        return 'מנהל';
      case Role.Subscriber:
        return 'מנוי';
      default:
        return 'חינמי';
    }
  }

  toggleSubscription(user: UserResponse): void {
    this.userService.updateSubscription(user.id, !user.isSubscriber).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) =>
            u.id === user.id ? { ...u, isSubscriber: !u.isSubscriber } : u,
          ),
        );
      },
    });
  }

  makeAdmin(user: UserResponse): void {
    if (!confirm(`להפוך את ${user.email} למנהל?`)) {
      return;
    }
    this.userService.makeAdmin(user.id).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u.id === user.id ? { ...u, role: Role.Admin } : u)),
        );
      },
    });
  }

  deleteUser(user: UserResponse): void {
    if (!confirm(`למחוק את ${user.email}?`)) {
      return;
    }
    this.userService.delete(user.id).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.id !== user.id));
      },
    });
  }
}
