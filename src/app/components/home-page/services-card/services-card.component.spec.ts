import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesCardComponent } from './services-card.component';

describe('ServicesCardComponent', () => {
	let component: ServicesCardComponent;
	let fixture: ComponentFixture<ServicesCardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ServicesCardComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(ServicesCardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
