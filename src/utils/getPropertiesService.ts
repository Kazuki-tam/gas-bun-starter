/**
 * Reads a script property shared by every user of this script.
 * @param propertyName - Key in `PropertiesService.getScriptProperties()`.
 * @returns The stored property value.
 * @throws If the property is missing.
 * @see https://developers.google.com/apps-script/reference/properties/properties-service
 */
function getPropertiesService(propertyName: string): string {
	const propertyValue =
		PropertiesService.getScriptProperties().getProperty(propertyName);

	if (propertyValue === null) {
		throw new Error(`Error: ${propertyName} is not defined.`);
	}

	return propertyValue;
}

export { getPropertiesService };
