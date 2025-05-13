import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnfermeraDashboardComponent } from './enfermera-dashboard.component';

describe('EnfermeraDashboardComponent', () => {
  let component: EnfermeraDashboardComponent;
  let fixture: ComponentFixture<EnfermeraDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnfermeraDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnfermeraDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
