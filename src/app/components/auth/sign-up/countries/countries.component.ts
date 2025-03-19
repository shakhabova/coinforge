import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiStringMatcher } from '@taiga-ui/cdk';
import {
	TuiDataListWrapper,
	TuiFilterByInputPipe,
	TuiStringifyContentPipe,
} from '@taiga-ui/kit';
import {
	TuiComboBoxModule,
	TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { COUNTRIES } from 'utils/countries';

@Component({
	selector: 'app-countries',
	imports: [
		ReactiveFormsModule,
		TuiComboBoxModule,
		TuiDataListWrapper,
		TuiStringifyContentPipe,
		TuiFilterByInputPipe,
	],
	templateUrl: './countries.component.html',
	styleUrl: './countries.component.css',
})
export class CountriesComponent {
	countries = COUNTRIES.map((country) => country.countryCodeAlpha3);
	model = new FormControl<string>('');

	// countryMatcher: TuiStringMatcher<typeof COUNTRIES[0]> = (country: typeof COUNTRIES[0], search): boolean => country.name.toLowerCase().startsWith(search);
	protected readonly stringify = (code: string): string =>
		!code
			? ''
			: COUNTRIES.find((country) => country.countryCodeAlpha3 === code)!.name;
}
