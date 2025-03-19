import { Injectable } from '@angular/core';
import thinbusSRP from 'thinbus-srp/browser.js';
import thinbusSRPServer from 'thinbus-srp/server.js';
import { environment } from '../../environment/environment';
import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;

@Injectable({
	providedIn: 'root',
})
export class SrpClientService {
	constructor() {
		// @ts-ignore
		window.server = thinbusSRPServer;
		// @ts-ignore
		window.client = thinbusSRP;
	}
	public srpClient() {
		const SrpClientConstructor = thinbusSRP(
			environment.srp6.N_base10,
			environment.srp6.g_base10,
			environment.srp6.k_base16,
		);
		const client = new SrpClientConstructor();
		return client;
	}
}
