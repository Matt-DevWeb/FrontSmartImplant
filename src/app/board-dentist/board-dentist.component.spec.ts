import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardDentistComponent } from './board-dentist.component';

describe('BoardDentistComponent', () => {
  let component: BoardDentistComponent;
  let fixture: ComponentFixture<BoardDentistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardDentistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardDentistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
