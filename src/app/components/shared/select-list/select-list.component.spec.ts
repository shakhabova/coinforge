import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectListComponent } from './select-list.component';

describe('SelectListComponent', () => {
	let component: SelectListComponent;
	let fixture: ComponentFixture<SelectListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [SelectListComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(SelectListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
