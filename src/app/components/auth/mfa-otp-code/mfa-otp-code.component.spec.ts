import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { MfaOtpCodeComponent } from './mfa-otp-code.component';

describe('MfaOtpCodeComponent', () => {
	let component: MfaOtpCodeComponent;
	let fixture: ComponentFixture<MfaOtpCodeComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MfaOtpCodeComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(MfaOtpCodeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
