import { Route } from '@angular/router';

export const routes: Route[] = [
	{
		path: '',
		loadComponent: () =>
			import('./wallets-page.component.ts.component').then(
				(m) => m.WalletsPageComponentTsComponent,
			),
		title: 'Wallets',
	},
	{
		path: ':address',
		loadComponent: () =>
			import('./wallet-info/wallet-info.component').then(
				(m) => m.WalletInfoComponent,
			),
		title: 'Wallet Info',
	},
];
