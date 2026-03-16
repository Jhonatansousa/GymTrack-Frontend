import { Component, inject, OnInit, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DivisionService } from '../../../core/services/division.service';
import { WorkoutDivisionResponseDTO } from '../../../core/models/division.model';
import {
  DivisionDialogComponent,
  DivisionDialogData,
} from '../division-dialog/division-dialog.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-divisions-list',
  standalone: true,
  imports: [
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './divisions-list.component.html',
  styleUrl: './divisions-list.component.scss',
})
export class DivisionsListComponent implements OnInit {
  private divisionService = inject(DivisionService);
  private dialog = inject(MatDialog);

  divisions = this.divisionService.divisions;
  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.isLoading.set(true);
    this.divisionService.loadDivisions().subscribe({
      next: () => {
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.hasError.set(true);
        this.errorMessage.set('Não foi possível carregar as divisões.');
      },
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DivisionDialogComponent, {
      width: '420px',
    });

    dialogRef.afterClosed().subscribe((result?: { name?: string }) => {
      if (!result?.name) {
        return;
      }

      this.divisionService.createDivision({ name: result.name }).subscribe({
        error: () => {
          this.hasError.set(true);
          this.errorMessage.set('Não foi possível criar a divisão.');
        },
      });
    });
  }

  openEditDialog(division: WorkoutDivisionResponseDTO): void {
    const data: DivisionDialogData = {
      id: division.id,
      name: division.name,
    };

    const dialogRef = this.dialog.open(DivisionDialogComponent, {
      width: '420px',
      data,
    });

    dialogRef.afterClosed().subscribe((result?: { name?: string }) => {
      if (!result?.name) {
        return;
      }

      this.divisionService
        .updateDivision(division.id, { newName: result.name })
        .subscribe({
          error: () => {
            this.hasError.set(true);
            this.errorMessage.set('Não foi possível atualizar a divisão.');
          },
        });
    });
  }

  confirmDelete(division: WorkoutDivisionResponseDTO): void {
    const data: ConfirmDialogData = {
      title: 'Confirmar exclusão',
      message:
        'Atenção: Deletar esta divisão apagará permanentemente todos os exercícios e séries contidos nela.',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.divisionService.deleteDivision(division.id).subscribe({
        error: () => {
          this.hasError.set(true);
          this.errorMessage.set('Não foi possível excluir a divisão.');
        },
      });
    });
  }

  viewExercises(_division: WorkoutDivisionResponseDTO): void {}
}
