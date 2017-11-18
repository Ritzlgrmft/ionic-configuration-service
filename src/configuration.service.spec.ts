// tslint:disable:no-magic-numbers
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { getTestBed, TestBed } from "@angular/core/testing";

import { ConfigurationService } from "./configuration.service";

describe("ConfigurationService", () => {

	interface ComplexObject {
		prop1: number;
		prop2: string;
	}

	let injector: TestBed;
	let configurationService: ConfigurationService;
	let httpMock: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				ConfigurationService,
			],
		});
		injector = getTestBed();
		configurationService = injector.get(ConfigurationService);
		httpMock = injector.get(HttpTestingController);
	});

	afterEach(() => {
		httpMock.verify();
	});

	describe("load(settingsUrl: string): Promise<void>", () => {

		it("returned promise gets resolved when settings is loaded", async (done) => {
			configurationService.load("settings.json").then(() => {
				done();
			});

			const req = httpMock.expectOne("settings.json");
			expect(req.request.method).toBe("GET");
			req.flush("");
		});

		it("returned promise gets rejected when settings do not exist", async (done) => {
			configurationService.load("unknown.json").catch((reason) => {
				expect(reason).toEqual(jasmine.any(Error));
				expect(reason.message).toBe("unknown.json could not be loaded: 404");
				done();
			});

			const req = httpMock.expectOne("unknown.json");
			expect(req.request.method).toBe("GET");
			req.flush("", { status: 404, statusText: "Not Found" });
		});
	});

	describe("getValue(key: string): any", () => {

		it("returns undefined if configuration is not loaded", () => {
			const value = configurationService.getValue("xxx");
			expect(value).toBeUndefined();
		});

		it("returns value of existing simple string", async (done) => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue<string>("simpleString");
				expect(value).toBe("abc");
				done();
			});

			const req = httpMock.expectOne("settings.json");
			expect(req.request.method).toBe("GET");
			req.flush({
				simpleString: "abc",
			});
		});

		it("returns value of existing simple number", async (done) => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue<number>("simpleNumber");
				expect(value).toBe(42);
				done();
			});

			const req = httpMock.expectOne("settings.json");
			expect(req.request.method).toBe("GET");
			req.flush({
				simpleNumber: 42,
			});
		});

		it("returns value of existing complex object", async (done) => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue<ComplexObject>("complexObject");
				expect(value.prop1).toBe(1);
				expect(value.prop2).toBe("x");
				done();
			});

			const req = httpMock.expectOne("settings.json");
			expect(req.request.method).toBe("GET");
			req.flush({
				complexObject: {
					prop1: 1,
					prop2: "x",
				},
			});
		});

		it("returns undefined if key does not exist", async (done) => {
			configurationService.load("settings.json").then(() => {
				const value = configurationService.getValue("unknown");
				expect(value).toBeUndefined();
				done();
			});

			const req = httpMock.expectOne("settings.json");
			expect(req.request.method).toBe("GET");
			req.flush("");
		});
	});

	describe("getKeys(): string[]", () => {

		it("returns all keys from settings", async (done) => {
			configurationService.load("settings.json").then(() => {
				const keys = configurationService.getKeys();
				expect(keys.length).toBe(3);
				expect(keys).toEqual(["complexObject", "simpleNumber", "simpleString"]);
				done();
			});

			const req = httpMock.expectOne("settings.json");
			expect(req.request.method).toBe("GET");
			req.flush({
				complexObject: {
					prop1: 1,
					prop2: "x",
				},
				simpleNumber: 42,
				simpleString: "abc",
			});
		});
	});
});
