import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletsPageComponentTsComponent } from './wallets-page.component.ts.component';

describe('WalletsPageComponentTsComponent', () => {
	let component: WalletsPageComponentTsComponent;
	let fixture: ComponentFixture<WalletsPageComponentTsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [WalletsPageComponentTsComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(WalletsPageComponentTsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
