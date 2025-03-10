import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardPatientComponent } from './board-patient.component';

describe('BoardPatientComponent', () => {
  let component: BoardPatientComponent;
  let fixture: ComponentFixture<BoardPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardPatientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
