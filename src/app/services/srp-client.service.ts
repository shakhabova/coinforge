import { Injectable } from "@angular/core";
import thinbusSRP from 'thinbus-srp/client.js';
import { environment } from "../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class SrpClientService {
  public readonly srpClient;

  constructor() {
    const SrpClientConstructor = thinbusSRP(environment.srp6.N_base10, environment.srp6.g_base10, environment.srp6.k_base16);
    this.srpClient = new SrpClientConstructor();
  }
}