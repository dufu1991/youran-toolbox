const XMLNS = 'http://www.w3.org/2000/svg';
const XLINK = 'http://www.w3.org/1999/xlink';

export interface SvgSplitIcon {
	id: string;
	name: string;
	fileName: string;
	filePath: string;
	viewBox: string;
	svgText: string;
	bytes: number;
	searchText: string;
	sourceType: 'sprite' | 'files';
}

const textEncoder = new TextEncoder();

export const sanitizeFileName = (id: string, fallback: string) => {
	const fileName = id
		.trim()
		.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^\.+$/, '')
		.replace(/^\.+/, '')
		.replace(/\.+$/, '');

	return fileName || fallback;
};

export const uniqueFileName = (fileName: string, usedNames: Set<string>) => {
	const lowerName = fileName.toLowerCase();

	if (!usedNames.has(lowerName)) {
		usedNames.add(lowerName);
		return fileName;
	}

	let index = 2;
	let nextName = `${fileName}-${index}`;

	while (usedNames.has(nextName.toLowerCase())) {
		index += 1;
		nextName = `${fileName}-${index}`;
	}

	usedNames.add(nextName.toLowerCase());
	return nextName;
};

export const formatBytes = (bytes: number) => {
	if (bytes < 1024) return `${bytes} B`;
	return `${(bytes / 1024).toFixed(1)} KB`;
};

const getParseError = (documentNode: Document) => {
	const parseError = documentNode.querySelector('parsererror');
	return parseError ? parseError.textContent?.trim() || 'SVG parse error' : '';
};

const parseSvgDocument = (source: string) => {
	const documentNode = new DOMParser().parseFromString(source, 'image/svg+xml');
	const error = getParseError(documentNode);

	if (error) {
		throw new Error('svgSplit.parseError');
	}

	return documentNode;
};

const escapeXmlAttribute = (value: string) =>
	value
		.replaceAll('&', '&amp;')
		.replaceAll('"', '&quot;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');

const parseSvgLength = (value: string | null) => {
	const match = value?.trim().match(/^-?\d*\.?\d+/);
	return match?.[0] || '';
};

const viewBoxFromSize = (svg: SVGSVGElement) => {
	const width = parseSvgLength(svg.getAttribute('width'));
	const height = parseSvgLength(svg.getAttribute('height'));
	return width && height ? `0 0 ${width} ${height}` : '';
};

export const symbolToSvgText = (symbol: SVGSymbolElement, index: number) => {
	const svg = document.createElementNS(XMLNS, 'svg');
	const symbolId = symbol.getAttribute('id') || `icon-${index + 1}`;

	svg.setAttribute('xmlns', XMLNS);
	svg.setAttribute('xmlns:xlink', XLINK);

	Array.from(symbol.attributes).forEach((attribute) => {
		if (attribute.name === 'id' || attribute.name === 'xmlns' || attribute.name === 'xmlns:xlink') {
			return;
		}

		svg.setAttribute(attribute.name, attribute.value);
	});

	Array.from(symbol.childNodes).forEach((child) => {
		svg.appendChild(child.cloneNode(true));
	});

	const svgText = new XMLSerializer()
		.serializeToString(svg)
		.replace(/></g, '>\n<')
		.replace(/^<svg/, `<svg data-name="${escapeXmlAttribute(symbolId)}"`);

	return `${svgText}\n`;
};

export const parseSvgSprite = (source: string) => {
	const documentNode = parseSvgDocument(source);
	const symbols = Array.from(documentNode.querySelectorAll('symbol'));

	if (symbols.length === 0) {
		throw new Error('svgSplit.noSymbolError');
	}

	const usedNames = new Set<string>();

	return symbols.map((symbol, index): SvgSplitIcon => {
		const id = symbol.getAttribute('id') || `icon-${index + 1}`;
		const name = uniqueFileName(sanitizeFileName(id, `icon-${index + 1}`), usedNames);
		const fileName = `${name}.svg`;
		const filePath = `icons/${fileName}`;
		const viewBox = symbol.getAttribute('viewBox') || '';
		const svgText = symbolToSvgText(symbol as SVGSymbolElement, index);

		return {
			id,
			name,
			fileName,
			filePath,
			viewBox,
			svgText,
			bytes: textEncoder.encode(svgText).length,
			searchText: `${name} ${filePath}`.toLowerCase(),
			sourceType: 'sprite'
		};
	});
};

export const svgFileToIcon = (
	source: string,
	rawName: string,
	index: number,
	usedNames: Set<string>,
	sourcePath?: string
) => {
	const documentNode = parseSvgDocument(source);

	if (documentNode.documentElement?.localName !== 'svg') {
		throw new Error('svgSplit.invalidSvgError');
	}

	const baseName = rawName.replace(/\.svg$/i, '') || `icon-${index + 1}`;
	const name = uniqueFileName(sanitizeFileName(baseName, `icon-${index + 1}`), usedNames);
	const fileName = `${name}.svg`;
	const viewBox =
		documentNode.documentElement.getAttribute('viewBox') ||
		viewBoxFromSize(documentNode.documentElement as unknown as SVGSVGElement);
	const svgText = source.endsWith('\n') ? source : `${source}\n`;

	return {
		id: rawName || fileName,
		name,
		fileName,
		filePath: sourcePath || fileName,
		viewBox,
		svgText,
		bytes: textEncoder.encode(svgText).length,
		searchText: `${name} ${fileName} ${sourcePath || ''}`.toLowerCase(),
		sourceType: 'files'
	} satisfies SvgSplitIcon;
};

const standaloneSvgToSymbol = (icon: SvgSplitIcon) => {
	const documentNode = parseSvgDocument(icon.svgText);

	if (documentNode.documentElement?.localName !== 'svg') {
		throw new Error('svgSplit.invalidSvgError');
	}

	const rootSvg = documentNode.documentElement as unknown as SVGSVGElement;
	const symbol = document.createElementNS(XMLNS, 'symbol');
	symbol.setAttribute('id', icon.name);

	Array.from(rootSvg.attributes).forEach((attribute) => {
		if (
			attribute.name === 'id' ||
			attribute.name === 'xmlns' ||
			attribute.name === 'xmlns:xlink' ||
			attribute.name === 'width' ||
			attribute.name === 'height' ||
			attribute.name === 'version'
		) {
			return;
		}

		symbol.setAttribute(attribute.name, attribute.value);
	});

	if (!symbol.hasAttribute('viewBox')) {
		const viewBox = viewBoxFromSize(rootSvg);
		if (viewBox) {
			symbol.setAttribute('viewBox', viewBox);
		}
	}

	Array.from(rootSvg.childNodes).forEach((child) => {
		symbol.appendChild(child.cloneNode(true));
	});

	return symbol;
};

export const mergeSvgIconsToSprite = (icons: SvgSplitIcon[], spriteId = 'svg-sprite') => {
	const svg = document.createElementNS(XMLNS, 'svg');
	svg.setAttribute('xmlns', XMLNS);
	svg.setAttribute('xmlns:xlink', XLINK);
	svg.setAttribute('id', sanitizeFileName(spriteId, 'svg-sprite'));
	svg.setAttribute('style', 'display: none;');

	icons.forEach((icon) => {
		svg.appendChild(standaloneSvgToSymbol(icon));
	});

	const svgText = new XMLSerializer()
		.serializeToString(svg)
		.replace(/><symbol/g, '>\n<symbol')
		.replace(/<\/symbol></g, '</symbol>\n<');

	return `${svgText}\n`;
};
