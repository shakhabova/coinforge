import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MfaConnectComponent } from './mfa-connect.component';

describe('MfaConnectComponent', () => {
  let component: MfaConnectComponent;
  let fixture: ComponentFixture<MfaConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MfaConnectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MfaConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
