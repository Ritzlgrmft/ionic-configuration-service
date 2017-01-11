// tslint:disable:no-magic-numbers
import { inject, TestBed } from "@angular/core/testing";
import { BaseRequestOptions, Http, Response, ResponseOptions } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";

import { ConfigurationService } from "./configuration.service";

describe("ConfigurationService", () => {

	interface ComplexObject {
		prop1: number;
		prop2: string;
	}

	let configurationService: ConfigurationService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ConfigurationService,
				BaseRequestOptions,
				MockBackend,
				{
					provide: Http,
					useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
						return new Http(backend, defaultOptions);
					},
					deps: [MockBackend, BaseRequestOptions]
				}
			]
		});
	});

	beforeEach(inject([MockBackend], (backend: MockBackend) => {
		const configuration = {
			"simpleString": "abc",
			"simpleNumber": 42,
			"complexObject": {
				"prop1": 1,
				"prop2": "x"
			}
		};
		const jsonResponse = new Response(new ResponseOptions({
			body: JSON.stringify(configuration),
			status: 200
		}));
		const textResponse = new Response(new ResponseOptions({
			body: "some text",
			status: 200
		}));
		const notFoundResponse = new Response(new ResponseOptions({
			status: 404
		}));
		backend.connections.subscribe((c: MockConnection) => {
			if (c.request.url.endsWith("settings.json")) {
				c.mockRespond(jsonResponse);
			} else if (c.request.url.endsWith("settings.txt")) {
				c.mockRespond(textResponse);
			} else {
				c.mockRespond(notFoundResponse);
			}
		});
	}));

	beforeEach(inject([ConfigurationService],
		(_configurationService: ConfigurationService) => {
			configurationService = _configurationService;
		}));

	describe("load(settingsUrl: string): Promise<void>", () => {

		it("returned promise gets resolved when settings is loaded", done => {
			configurationService.load("settings.json").then(() => {
				done();
			});
		});

		it("returned promise gets rejected when settings do not exist", done => {
			configurationService.load("unknown.json").catch(reason => {
				expect(reason).toEqual(jasmine.any(Error));
				expect(reason.message).toBe("unknown.json could not be loaded: 404");
				done();
			});
		});

		it("returned promise gets rejected when invalid settings is loaded", done => {
			configurationService.load("settings.txt").catch(reason => {
				expect(reason).toEqual(jasmine.any(SyntaxError));
				done();
			});
		});
	});

	describe("getValue(key: string): any", () => {

		it("returns undefined if configuration is not loaded", () => {
			const value = configurationService.getValue("xxx");
			expect(value).toBeUndefined();
		});

		it("returns value of existing simple string", done => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue<string>("simpleString");
				expect(value).toBe("abc");
				done();
			});
		});

		it("returns value of existing simple number", done => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue<number>("simpleNumber");
				expect(value).toBe(42);
				done();
			});
		});

		it("returns value of existing complex object", done => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue<ComplexObject>("complexObject");
				expect(value.prop1).toBe(1);
				expect(value.prop2).toBe("x");
				done();
			});
		});

		it("returns undefined if key does not exist", done => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue("unknown");
				expect(value).toBeUndefined();
				done();
			});
		});
	});

	describe("getKeys(): string[]", () => {

		it("returns all keys from settings", done => {
			configurationService.load("settings.json").then(() => {
				const keys = configurationService.getKeys();
				expect(keys.length).toBe(3);
				expect(keys).toEqual(["simpleString", "simpleNumber", "complexObject"]);
				done();
			});
		});
	});
});