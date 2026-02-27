import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PiezaDental } from '../../../../core/interfaces';
import { DialogoPiezaDentalComponent } from './dialogo-pieza-dental.component';

@Component({
  selector: 'app-pieza-dental',
  standalone: true,
  imports: [CommonModule, DialogoPiezaDentalComponent],
  template: `
    <div class="pieza-dental" 
         [class.readonly]="modoLectura"
         [class.sano]="pieza.estado.condicion === 'sano'"
         [class.cariado]="pieza.estado.condicion === 'cariado'"
         [class.obturado]="pieza.estado.condicion === 'obturado'"
         [class.ausente]="pieza.estado.condicion === 'ausente'"
         [class.corona]="pieza.estado.condicion === 'corona'"
         [class.endodoncia]="pieza.estado.condicion === 'endodoncia'"
         (click)="onClick()">
      <span class="numero">{{pieza.numeroPieza}}</span>
      <div class="estado">{{pieza.estado.condicion}}</div>
    </div>
    <app-dialogo-pieza-dental #dialogo></app-dialogo-pieza-dental>
  `,
  styles: [`
    .pieza-dental {
      border: 1px solid #ccc;
      padding: 10px;
      margin: 5px;
      cursor: pointer;
      text-align: center;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .pieza-dental:hover:not(.readonly) {
      background-color: #f5f5f5;
    }

    .readonly {
      cursor: default;
      opacity: 0.8;
    }

    .numero {
      font-weight: bold;
      display: block;
    }

    .estado {
      font-size: 0.8em;
      color: #666;
    }

    .sano { background-color: #e8f5e9; }
    .cariado { background-color: #ffebee; }
    .obturado { background-color: #e3f2fd; }
    .ausente { background-color: #f5f5f5; }
    .corona { background-color: #fff3e0; }
    .endodoncia { background-color: #f3e5f5; }
  `]
})
export class PiezaDentalComponent {
  @Input() pieza!: PiezaDental;
  @Input() modoLectura: boolean = false;
  @Output() piezaClick = new EventEmitter<void>();
  @ViewChild('dialogo') dialogo!: DialogoPiezaDentalComponent;

  onClick() {
    if (!this.modoLectura) {
      this.dialogo.mostrar(this.pieza);
      this.piezaClick.emit();
    }
  }
}
