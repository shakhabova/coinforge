import { type ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletItemOptionComponent } from './wallet-item-option.component';

describe('WalletItemOptionComponent', () => {
	let component: WalletItemOptionComponent;
	let fixture: ComponentFixture<WalletItemOptionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [WalletItemOptionComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(WalletItemOptionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
