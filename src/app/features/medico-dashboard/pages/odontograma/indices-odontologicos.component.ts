import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndiceOdontologico } from '../../../../core/interfaces';

@Component({
  selector: 'app-indices-odontologicos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="indices-container">
      <h3>Índices Odontológicos</h3>
      <div class="indices-grid">
        <div *ngFor="let indice of indices" class="indice-card">
          <h4>{{indice.tipo}}</h4>
          <p class="valor">{{indice.valor}}</p>
          <div class="detalles" *ngIf="indice.detalles">
            <p *ngIf="indice.detalles.cariados">Cariados: {{indice.detalles.cariados}}</p>
            <p *ngIf="indice.detalles.perdidos">Perdidos: {{indice.detalles.perdidos}}</p>
            <p *ngIf="indice.detalles.obturados">Obturados: {{indice.detalles.obturados}}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .indices-container {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    h3 {
      margin: 0 0 15px 0;
      color: #333;
    }

    .indices-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }

    .indice-card {
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      background-color: #fff;
    }

    h4 {
      margin: 0 0 10px 0;
      color: #666;
    }

    .valor {
      font-size: 24px;
      font-weight: bold;
      color: #2196f3;
      margin: 10px 0;
    }

    .detalles {
      font-size: 14px;
      color: #666;
    }

    .detalles p {
      margin: 5px 0;
    }
  `]
})
export class IndicesOdontologicosComponent {
  @Input() indices: IndiceOdontologico[] = [];
  @Input() modoLectura: boolean = false;
}
