import { Injectable } from "@angular/core";
import * as thinbusSRP from 'thinbus-srp/client.js';
import { environment } from "../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class SrpClientService {
  public readonly srpClient;

  constructor() {
    const SrpClientConstructor = thinbusSRP(environment.N_base10, environment.g_base10, environment.k_base16);
    this.srpClient = new SrpClientConstructor();
  }
}