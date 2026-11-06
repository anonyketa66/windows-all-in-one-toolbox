export function formatProcessorName(model: string) {
  return model
    .replace(/\((?:R|TM)\)|[®™]/gi, '')
    .replace(/^\s*\d+(?:st|nd|rd|th)\s+Gen\s+(?=Intel\b)/i, '')
    .replace(/\s+@\s*\d+(?:[.,]\d+)?\s*(?:GHz|MHz)\s*$/i, '')
    .replace(/\s+with\s+(?:AMD\s+)?Radeon(?:\s+\d+[A-Z]*)?\s+Graphics\s*$/i, '')
    .replace(/\s+(?:\d+-Core\s+)?Processor\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatMotherboardName(model: string) {
  const name = model.trim()
    .replace(/^Micro-Star International(?:\s+Co\.,?\s+Ltd\.?)?(?=\s|$)/i, 'MSI')
    .replace(/^ASUSTeK COMPUTER INC\.?(?=\s|$)/i, 'ASUS')
    .replace(/^Gigabyte Technology Co\.,?\s+Ltd\.?(?=\s|$)/i, 'Gigabyte')
    .replace(/\s+/g, ' ');

  return name.replace(/^(MSI\s+\w[^()]*?)\s+\(MS-[\w-]+\)$/i, '$1');
}
