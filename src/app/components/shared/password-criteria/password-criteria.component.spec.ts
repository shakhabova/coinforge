import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordCriteriaComponent } from './password-criteria.component';

describe('PasswordCriteriaComponent', () => {
	let component: PasswordCriteriaComponent;
	let fixture: ComponentFixture<PasswordCriteriaComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [PasswordCriteriaComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(PasswordCriteriaComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
