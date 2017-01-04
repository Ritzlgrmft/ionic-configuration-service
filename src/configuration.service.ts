import { Injectable } from "@angular/core";

import { Http } from "@angular/http";

import "rxjs/add/operator/toPromise";

@Injectable()
export class ConfigurationService {

	constructor(private http: Http) {
	}

	private configValues: { [key: string]: any };

	/**
	 * Get all available keys.
	 */
	public getKeys(): string[] {
		let keys: string[] = [];
		for (let key in this.configValues) {
			if (this.configValues.hasOwnProperty(key)) {
				keys.push(key);
			}
		}
		return keys;
	}

	/**
	 * Get the configuration data for the given key.
	 */
	public getValue(key: string): any {
		if (this.configValues) {
			return this.configValues[key];
		} else {
			return undefined;
		}
	}

	/**
	 * Loads the configuration from the given url.
	 */
	public load(settingsUrl: string): Promise<void> {
		let promise = this.http
			.get(settingsUrl)
			.toPromise()
			.then(response => {
				if (response.ok) {
					this.configValues = response.json();
				} else {
					throw new Error(`${settingsUrl} could not be loaded: ${response.status}`);
				}
			});
		return promise;
	}
}