import { Injectable } from "@angular/core";

import { Http } from "@angular/http";

import "rxjs/add/operator/toPromise";

/**
 * Service which encapsulates configuration functionalities for apps built with Ionic framework.
 */
@Injectable()
export class ConfigurationService {

	constructor(private http: Http) {
	}

	/**
	 * Internal storage of the configuration data.
	 */
	private configValues: { [key: string]: any };

	/**
	 * Get all available keys.
	 * @returns all available keys
	 */
	public getKeys(): string[] {
		const keys: string[] = [];
		// tslint:disable-next-line:forin
		for (const key in this.configValues) {
			keys.push(key);
		}
		return keys;
	}

	/**
	 * Get the configuration data for the given key.
	 * @param T type of the returned value (default: object)
	 * @param key key of the configuration data
	 * @returns configuration data for the given key
	 */
	public getValue<T>(key: string): T {
		if (this.configValues !== undefined) {
			return this.configValues[key];
		} else {
			return undefined;
		}
	}

	/**
	 * Loads the configuration from the given url.
	 * @param configurationUrl url from which the configuration should be loaded
	 * @returns promise which gets resolved as soon as the data is loaded; in case of an error, the promise gets rejected
	 */
	public load(configurationUrl: string): Promise<void> {
		const promise = this.http
			.get(configurationUrl)
			.toPromise()
			.then(response => {
				if (response.ok) {
					this.configValues = response.json();
				} else {
					throw new Error(`${configurationUrl} could not be loaded: ${response.status}`);
				}
			});
		return promise;
	}
}