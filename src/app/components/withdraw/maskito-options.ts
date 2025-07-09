import { maskitoUpdateElement, type MaskitoElement, type MaskitoMask, type MaskitoPostprocessor } from '@maskito/core';
import { DECIMAL_POINT_CHAR } from './constants';

export const customMaskitoPostprocessor: MaskitoPostprocessor = ({ value, selection }, initialElementState) => {
	const [from, to] = selection;
	const initValue = initialElementState.value;
	let newValue = value;
	console.log(value);
	if (value.startsWith('0')) {
		if (value.includes('.') && /[1-9]+0*\./.test(value)) {
			newValue = value.replace(/^0+/, '');
		} else if (!value.includes('.') && !initValue.includes('.')) {
			newValue = `0.${value}`;
			selection = [from + 2, to + 2];
		}
	}

	return {
		value: newValue,
		selection,
	};
};

export const maskitoMask = (): MaskitoMask => {
	return ({ value }) => {
		let isDotUsed = false;
		const digitsMask = Array.from(value).map((char) => {
			if (char === DECIMAL_POINT_CHAR) {
				if (!isDotUsed) {
					isDotUsed = true;
					return /\./;
				}
			}
			return /\d/;
		});

		if (!digitsMask.length) {
			return [/[\d\.]/];
		}

		return [...digitsMask];
	};
};

export const onBlurMaskitoPlugin = () => {
	return (element: MaskitoElement) => {
		const blurHandler = () => {
			const value = element.value;

			if (element.value.startsWith(DECIMAL_POINT_CHAR)) {
				maskitoUpdateElement(element, `0${element.value}`);
			} else if (
				element.value.startsWith('0') &&
				/[1-9]/.test(element.value) &&
				!element.value.includes(DECIMAL_POINT_CHAR)
			) {
				maskitoUpdateElement(element, `0.${element.value}`);
			}

			if (value.endsWith(DECIMAL_POINT_CHAR)) {
				maskitoUpdateElement(element, `${value.substring(0, value.length - 1)}`);
			}
		};

		element.addEventListener('blur', blurHandler);

		return () => element.removeEventListener('blur', blurHandler);
	};
};
