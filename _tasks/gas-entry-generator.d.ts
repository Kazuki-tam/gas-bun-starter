declare module "gas-entry-generator" {
	export type GenerateOptions = {
		comment?: boolean;
		autoGlobalExports?: boolean;
		globalIdentifierName?: string;
		exportsIdentifierName?: string;
	};

	export type GenerateResult = {
		entryPointFunctions: string;
		globalAssignments?: string;
	};

	export function generate(
		code: string,
		options?: GenerateOptions,
	): GenerateResult;
}
