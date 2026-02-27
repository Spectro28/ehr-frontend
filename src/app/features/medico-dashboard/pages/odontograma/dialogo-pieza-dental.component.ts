import { Component, Inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PiezaDental } from '../../../../core/interfaces';

@Component({
  selector: 'app-dialogo-pieza-dental',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialogo-container" [class.visible]="visible">
      <div class="dialogo-content">
        <div class="dialogo-header">
          <h3>Editar Pieza Dental {{pieza?.numeroPieza}}</h3>
          <button class="btn-close" (click)="cerrar()">&times;</button>
        </div>
        <div class="dialogo-body">
          <div class="form-group">
            <label>Estado:</label>
            <select [(ngModel)]="estadoSeleccionado" class="form-control">
              <option value="sano">Sano</option>
              <option value="cariado">Cariado</option>
              <option value="obturado">Obturado</option>
              <option value="ausente">Ausente</option>
              <option value="corona">Corona</option>
              <option value="endodoncia">Endodoncia</option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="detalles.movilidad">
              Movilidad
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="detalles.recesion">
              Recesión
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="detalles.manchas">
              Manchas
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="detalles.placa">
              Placa
            </label>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="detalles.calculos">
              Cálculos
            </label>
          </div>
        </div>
        <div class="dialogo-footer">
          <button class="btn btn-secondary" (click)="cerrar()">Cancelar</button>
          <button class="btn btn-primary" (click)="guardar()">Guardar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialogo-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialogo-container.visible {
      display: flex;
    }

    .dialogo-content {
      background-color: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .dialogo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .dialogo-header h3 {
      margin: 0;
      font-size: 1.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      color: #666;
    }

    .dialogo-body {
      margin-bottom: 20px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .dialogo-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background-color: #2196f3;
      color: white;
    }

    .btn-secondary {
      background-color: #f5f5f5;
      color: #333;
    }

    label {
      display: block;
      margin-bottom: 5px;
    }

    input[type="checkbox"] {
      margin-right: 8px;
    }
  `]
})
export class DialogoPiezaDentalComponent {
  @Input() visible = false;
  @Input() pieza: PiezaDental | null = null;

  estadoSeleccionado: 'sano' | 'cariado' | 'obturado' | 'ausente' | 'corona' | 'endodoncia' = 'sano';
  detalles = {
    movilidad: false,
    recesion: false,
    manchas: false,
    placa: false,
    calculos: false
  };

  mostrar(pieza: PiezaDental) {
    this.pieza = pieza;
    this.estadoSeleccionado = pieza.estado.condicion;
    if (pieza.estado) {
      this.detalles = {
        movilidad: !!pieza.estado.movilidad,
        recesion: !!pieza.estado.recesion,
        manchas: !!pieza.estado.manchas,
        placa: !!pieza.estado.placa,
        calculos: !!pieza.estado.calculos
      };
    }
    this.visible = true;
  }

  cerrar() {
    this.visible = false;
    this.pieza = null;
  }

  guardar() {
    if (this.pieza) {
      this.pieza.estado = {
        condicion: this.estadoSeleccionado,
        ...this.detalles
      };
    }
    this.cerrar();
  }
}
