import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class Users implements OnInit {
  private api = inject(UsersService);
  rows: any[] = [];
  displayedColumns = ['email', 'role', 'createdAt', 'updatedAt'];

  ngOnInit() {
    this.api.list().subscribe((r) => (this.rows = r));
  }
}
