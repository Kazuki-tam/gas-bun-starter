import { beforeEach, describe, expect, test } from "bun:test";
import { getPropertiesService } from "../utils/getPropertiesService.ts";

const properties = new Map<string, string | null>();

beforeEach(() => {
	properties.clear();
	globalThis.PropertiesService = {
		getScriptProperties: () => ({
			getProperty: (name: string) => {
				if (!properties.has(name)) {
					return null;
				}
				return properties.get(name) ?? null;
			},
		}),
	} as GoogleAppsScript.Properties.PropertiesService;
});

describe("getPropertiesService", () => {
	test("returns a defined property value", () => {
		properties.set("API_TOKEN", "secret");
		expect(getPropertiesService("API_TOKEN")).toBe("secret");
	});

	test("returns an empty string when that value is stored", () => {
		properties.set("OPTIONAL", "");
		expect(getPropertiesService("OPTIONAL")).toBe("");
	});

	test("throws when the property is missing", () => {
		expect(() => getPropertiesService("MISSING")).toThrow(
			"Error: MISSING is not defined.",
		);
	});
});
