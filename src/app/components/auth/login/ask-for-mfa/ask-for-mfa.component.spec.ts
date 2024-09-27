import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskForMfaComponent } from './ask-for-mfa.component';

describe('AskForMfaComponent', () => {
  let component: AskForMfaComponent;
  let fixture: ComponentFixture<AskForMfaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskForMfaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AskForMfaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
